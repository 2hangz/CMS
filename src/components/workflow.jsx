import React, { useEffect, useState, useRef } from "react";
import Navbar from "./navbar";

const API_BASE = "https://entyre-backend.onrender.com/api/workflow"; 

function NodeEditor({ node, onChange, onRemove }) {
  const fileInputRef = useRef();
  const [iconUploadError, setIconUploadError] = useState(null);
  const [iconUploading, setIconUploading] = useState(false);

  const update = (key, value) => onChange({ ...node, [key]: value });

  const handleIconFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconUploadError(null);
    setIconUploading(true);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      formData.append("name", "icon-upload");
      const res = await fetch("https://entyre-backend.onrender.com/api/upload-icon", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.url || data.fileUrl) {
        update("icon", data.url || data.fileUrl);
      } else {
        setIconUploadError("No fileUrl returned");
      }
    } catch (err) {
      setIconUploadError(err.message);
    } finally {
      setIconUploading(false);
    }
  };

  return (
    <div className="node-editor">
      <div>
        <label>
          id:
          <input value={node.id || ""} onChange={e => update("id", e.target.value)} required />
        </label>
        <label>
          label:
          <input className="node-label" value={node.label || ""} onChange={e => update("label", e.target.value)} />
        </label>
        <label>
          icon:
          <input
            className="node-icon"
            value={node.icon || ""}
            onChange={e => update("icon", e.target.value)}
            placeholder="icon url"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleIconFileChange}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={iconUploading}
          >
            {iconUploading ? "Uploading..." : "Upload"}
          </button>
          {node.icon && (
            <img src={node.icon} alt="icon" className="icon-img" />
          )}
          {iconUploadError && (
            <span className="icon-error">{iconUploadError}</span>
          )}
        </label>
        <label>
          type:
          <select 
            className="node-type" 
            value={node.type || ""} 
            onChange={e => update("type", e.target.value)}
          >
            <option value="iconNode">Connected Node</option>
            <option value="backgroundImage">Background Image</option>
            </select>
        </label>
        <label>
          selectable:
          <input type="checkbox" checked={!!node.selectable} onChange={e => update("selectable", e.target.checked)} />
        </label>
      </div>
      <div>
        <label>
          detail:
          <input className="node-detail" value={node.detail || ""} onChange={e => update("detail", e.target.value)} />
        </label>
        <button type="button" className="remove-btn" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

function ConnectionEditor({ conn, onChange, onRemove, allNodeIds = [] }) {
  const update = (key, value) => {
    onChange({ ...conn, [key]: value });
  };

  return (
    <div className="connection-editor">
      <label>
        from:
        <select
          className="conn-from"
          value={conn.from || ""}
          onChange={e => update("from", e.target.value)}
          required
        >
          <option value="">(select node)</option>
          {Array.isArray(allNodeIds) && allNodeIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </label>
      <label>
        to:
        <select
          className="conn-to"
          value={conn.to || ""}
          onChange={e => update("to", e.target.value)}
          required
        >
          <option value="">(select node)</option>
          {Array.isArray(allNodeIds) && allNodeIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
          </select>
      </label>
      <label>
        sourceHandle:
        <select
          className="conn-sourceHandle"
          value={conn.sourceHandle || ""}
          onChange={e => update("sourceHandle", e.target.value)}
        >
          <option value="">(none)</option>
          <option value="left">left</option>
          <option value="right">right</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
        </select>
      </label>

      <label>
        targetHandle:
        <select
          className="conn-targetHandle"
          value={conn.targetHandle || ""}
          onChange={e => update("targetHandle", e.target.value)}
        >
          <option value="">(none)</option>
          <option value="left">left</option>
          <option value="right">right</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
        </select>
      </label>

      <label>
        edgeStyle:
        <select
          className="conn-edgeStyle"
          value={conn.edgeStyle || ""}
          onChange={e => update("edgeStyle", e.target.value)}
        >
          <option value="">(none)</option>
          <option value="default">default</option>
          <option value="redDashed">redDashed</option>
          <option value="redSolid">redSolid</option>
          <option value="grayDashed">grayDashed</option>
          <option value="blueBold">blueBold</option>
        </select>
      </label>
      <label>
        edgeType:
        <select
          className="conn-edgeType"
          value={conn.edgeType || ""}
          onChange={e => update("edgeType", e.target.value)}
        >
          <option value="">(none)</option>
          <option value="step">Step</option>
          <option value="default">Curve</option>
          <option value="customPolyline">Custom Polyline</option>
          </select>
      </label>
      <button
        type="button"
        className="remove-btn"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

function NodePositionsEditor({ nodePositions, onChange, allNodeIds = [] }) {
  const [editingId, setEditingId] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const handleAdd = () => {
    if (!editingId || isNaN(Number(x)) || isNaN(Number(y))) return;
    onChange({ ...nodePositions, [editingId]: { x: Number(x), y: Number(y) } });
    setEditingId("");
    setX("");
    setY("");
  };

  const handleRemove = (id) => {
    const copy = { ...nodePositions };
    delete copy[id];
    onChange(copy);
  };

  return (
    <div className="node-positions-editor">
      <div>
        <strong>Node Positions</strong>
      </div>
      {Object.entries(nodePositions || {}).map(([id, pos]) => (
        <div key={id} className="node-pos-row">
          <span className="node-pos-id">{id}</span>: x: {pos.x}, y: {pos.y}
          <button type="button" className="remove-btn" onClick={() => handleRemove(id)}>Remove</button>
        </div>
      ))}
      <div className="add-update-row">
        <select 
        placeholder="node id" 
        value={editingId} 
        onChange={e => setEditingId(e.target.value)} 
        >
          <option value="">(select node)</option>
          {Array.isArray(allNodeIds) && allNodeIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
          </select>
        <input className="x" placeholder="x" value={x} onChange={e => setX(e.target.value)} />
        <input className="y" placeholder="y" value={y} onChange={e => setY(e.target.value)} />
        <button type="button" onClick={handleAdd}>Add/Update</button>
      </div>
    </div>
  );
}

function WorkflowCMS() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  // fetch all workflows
  useEffect(() => {
    setLoading(true);
    fetch(API_BASE)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch workflows");
        return res.json();
      })
      .then(data => {
        setWorkflows(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Error loading workflows");
        setLoading(false);
      });
  }, []);

  // Edit
  const handleEdit = (wf) => {
    setEditing(wf);
  };

  // delete
  const handleDelete = (_id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    fetch(`${API_BASE}/${_id}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete workflow");
        setWorkflows(workflows.filter(wf => (wf._id) !== _id));
      })
      .catch(err => alert(err.message || "Error deleting workflow"));
  };

  // save
  const handleSave = async (data) => {
    const isEdit = !!(data._id);
    const url = isEdit ? `${API_BASE}/${data._id}` : API_BASE;
    const method = isEdit ? "PUT" : "POST";

    const body = {
      name: data.name,
      status: data.status,
      description: data.description,
      nodes: data.nodes || [],
      connections: data.connections || [],
      nodePositions: data.nodePositions || {},
    };


    if (isEdit) {
      delete body._id;
      delete body.__v;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Failed to save workflow: " + errText);
      }
      const saved = await res.json();
      if (isEdit) {
        setWorkflows(workflows.map(w => (w._id === saved._id ? saved : w)));
      } else {
        setWorkflows([...workflows, saved]);
      }
      setEditing(null);
    } catch (err) {
      alert(err.message || "Error saving workflow");
    }
  };

  const handleCancel = () => setEditing(null);

  return (
    <div>
      <Navbar />
      <div className="workflow-cms-content">
        <h1>Workflow CMS</h1>
        {loading ? (
          <div>Loading workflows...</div>
        ) : error ? (
          <div className="workflow-cms-error">{error}</div>
        ) : (
          <>
            {!editing && (
              <div className="workflow-cms-create-btn">
                <button onClick={() => setEditing({
                  name: "",
                  status: "",
                  description: "",
                  nodes: [],
                  connections: [],
                  nodePositions: {},
                })}>Create New Workflow</button>
              </div>
            )}
            {editing ? (
              <WorkflowEditor
                workflow={editing}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <WorkflowList
                workflows={workflows}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// workflow List
function WorkflowList({ workflows, onEdit, onDelete }) {
  return (
    <div>
      <h2>Existing Workflows</h2>
      {workflows.length === 0 ? (
        <div>No workflows found.</div>
      ) : (
        <table className="cms-table workflow-list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Description</th>
              <th>Nodes</th>
              <th>Connections</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((wf) => (
              <tr key={wf._id || wf.id}>
                <td>{wf.name || "(untitled)"}</td>
                <td>{wf.status || ""}</td>
                <td>{wf.description || ""}</td>
                <td>{wf.nodes ? wf.nodes.length : 0}</td>
                <td>{wf.connections ? wf.connections.length : 0}</td>
                <td>
                  <button onClick={() => onEdit(wf)}>Edit</button>
                  <button onClick={() => onDelete(wf._id || wf.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// workflowEditor List
function WorkflowEditor({ workflow, onSave, onCancel }) {
  const [form, setForm] = useState(workflow);

  // nodes
  const handleNodeChange = (idx, newNode) => {
    const nodes = [...(form.nodes || [])];
    nodes[idx] = newNode;
    setForm({ ...form, nodes });
  };
  const handleNodeRemove = (idx) => {
    const nodes = [...(form.nodes || [])];
    nodes.splice(idx, 1);
    setForm({ ...form, nodes });
  };
  const handleNodeAdd = () => {
    setForm({ ...form, nodes: [...(form.nodes || []), { id: "", label: "", icon: "", type: "", detail: "", selectable: false }] });
  };

  // connections
  const handleConnChange = (idx, newConn) => {
    const connections = [...(form.connections || [])];
    connections[idx] = newConn;
    setForm({ ...form, connections });
  };
  const handleConnRemove = (idx) => {
    const connections = [...(form.connections || [])];
    connections.splice(idx, 1);
    setForm({ ...form, connections });
  };
  const handleConnAdd = () => {
    setForm({ ...form, connections: [...(form.connections || []), { from: "", to: "", sourceHandle: "", targetHandle: "", edgeStyle: "", edgeType: "" }] });
  };

  // node positions
  const handleNodePositionsChange = (newPositions) => {
    setForm({ ...form, nodePositions: newPositions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // nodePositions
    const cleanedNodePositions = {};
    Object.entries(form.nodePositions || {}).forEach(([nodeId, pos]) => {
      if (
        nodeId &&
        pos &&
        typeof pos.x === "number" &&
        typeof pos.y === "number" &&
        !isNaN(pos.x) &&
        !isNaN(pos.y)
      ) {
        cleanedNodePositions[nodeId] = { x: pos.x, y: pos.y };
      }
    });
    const submitData = {
      ...form,
      nodePositions: cleanedNodePositions,
    };
    if (submitData._id) {
      delete submitData._id;
      delete submitData.__v;
    }
    onSave({ ...form, nodePositions: cleanedNodePositions, _id: form._id });
  };

  return (
    <form onSubmit={handleSubmit} className="workflow-editor-form cms-form">
      <h3>{form._id ? "Edit Workflow" : "Create Workflow"}</h3>
      <div>
        <label>
          Name:
          <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </label>
      </div>
      <div>
        <label>
          Status:
          <input value={form.status || ""} onChange={e => setForm({ ...form, status: e.target.value })} />
        </label>
      </div>
      <div>
        <label>
          Description:
          <input value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
        </label>
      </div>
      <div className="section">
        <strong>Nodes</strong>
        {(form.nodes || []).map((node, idx) => (
          <NodeEditor
            key={idx}
            node={node}
            onChange={newNode => handleNodeChange(idx, newNode)}
            onRemove={() => handleNodeRemove(idx)}
          />
        ))}
        <button type="button" onClick={handleNodeAdd}>Add Node</button>
      </div>
      <div className="section">
        <strong>Connections</strong>
        {(form.connections || []).map((conn, idx) => (
          <ConnectionEditor
            key={idx}
            conn={conn}
            onChange={newConn => handleConnChange(idx, newConn)}
            onRemove={() => handleConnRemove(idx)}
            allNodeIds={(form.nodes || []).map(n => n.id)}
          />
        ))}
        <button type="button" onClick={handleConnAdd}>Add Connection</button>
      </div>
      <div className="section">
        <NodePositionsEditor
          nodePositions={form.nodePositions || {}}
          onChange={handleNodePositionsChange}
          allNodeIds={(form.nodes || []).map(n => n.id)}
        />
      </div>
      <div className="section">
        <button type="submit">Save</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default WorkflowCMS;