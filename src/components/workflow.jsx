import React, { useEffect, useState } from "react";
import Navbar from "./navbar";

import WorkflowList from "./workflow/WorkflowList";
import WorkflowEditor from "./workflow/WorkflowEditor";

const API_BASE = "https://entyre-backend.onrender.com/api/workflow";

// Main Workflow Component
function WorkflowCMS() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

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

  const handleEdit = (wf) => {
    setEditing(wf);
    setSelectedNodeId(null);
  };

  const handleDelete = (_id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    fetch(`${API_BASE}/${_id}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete workflow");
        setWorkflows(workflows.filter(wf => wf._id !== _id));
      })
      .catch(err => alert(err.message || "Error deleting workflow"));
  };

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
      setSelectedNodeId(null);
    } catch (err) {
      alert(err.message || "Error saving workflow");
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setSelectedNodeId(null);
  };

  return (
    <div className="cms-layout">
      <Navbar />
      <div className="cms-main-content">
        <div className="page-header">
          <h1 className="page-title">Workflow Management</h1>
          <p className="page-subtitle">Create and manage interactive workflows with real-time preview</p>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner"></div>
            Loading workflows...
          </div>
        ) : error ? (
          <div className="cms-message cms-message-error">{error}</div>
        ) : (
          <>
            {!editing && (
              <div style={{ marginBottom: '24px' }}>
                <button 
                  className="cms-btn cms-btn-primary"
                  onClick={() => setEditing({
                    name: "",
                    status: "Verified",
                    description: "",
                    nodes: [],
                    connections: [],
                    nodePositions: {},
                  })}
                >
                  Create New Workflow
                </button>
              </div>
            )}
            
            {editing ? (
              <WorkflowEditor
                workflow={editing}
                onSave={handleSave}
                onCancel={handleCancel}
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
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

export default WorkflowCMS;