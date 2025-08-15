
import React, { useEffect, useState } from "react";
import WorkflowPreview from "./WorkflowPreview";
import NodeEditor from "./NodeEditor";
import NodeListTable from "./NodeListTable";
import ConnectionEditor from "./ConnectionEditor";
import NodePositionsEditor from "./NodePositionsEditor";

function WorkflowEditor({ workflow, onSave, onCancel, selectedNodeId, onNodeSelect }) {
  const [form, setForm] = useState(workflow);
  const [activeTab, setActiveTab] = useState('basic');
  const [nodeListPage, setNodeListPage] = useState(1);

  // For node popup
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNodeIdx, setEditingNodeIdx] = useState(null);

  // When selectedNodeId changes, open popup for that node
  useEffect(() => {
    if (activeTab === 'nodes' && selectedNodeId) {
      const idx = (form.nodes || []).findIndex(n => n.id === selectedNodeId);
      if (idx !== -1) {
        setEditingNodeIdx(idx);
        setShowNodeEditor(true);
      }
    }
  }, [selectedNodeId, form.nodes, activeTab]);

  useEffect(() => {
    setNodeListPage(1);
  }, [activeTab, form.nodes?.length]);

  // When node popup closes, clear selectedNodeId
  const closeNodeEditor = () => {
    setShowNodeEditor(false);
    setEditingNodeIdx(null);
    onNodeSelect(null);
  };

  const handleNodePositionChange = (nodeId, position) => {
    const newPositions = { ...form.nodePositions, [nodeId]: position };
    setForm({ ...form, nodePositions: newPositions });
  };

  const handleNodeChange = (idx, newNode) => {
    const nodes = [...(form.nodes || [])];
    nodes[idx] = newNode;
    setForm({ ...form, nodes });
  };

  const handleNodeRemove = (idx) => {
    const nodes = [...(form.nodes || [])];
    const removedNode = nodes[idx];
    nodes.splice(idx, 1);
    
    // Remove related connections and positions
    const connections = (form.connections || []).filter(
      conn => conn.from !== removedNode.id && conn.to !== removedNode.id
    );
    const nodePositions = { ...form.nodePositions };
    delete nodePositions[removedNode.id];
    
    setForm({ ...form, nodes, connections, nodePositions });
    if (selectedNodeId === removedNode.id) {
      onNodeSelect(null);
    }
    setShowNodeEditor(false);
    setEditingNodeIdx(null);
  };

  const handleNodeAdd = () => {
    const newId = `node-${(form.nodes || []).length + 1}`;
    const newNode = { 
      id: newId, 
      label: `Node ${(form.nodes || []).length + 1}`, 
      icon: "", 
      type: "iconNode", 
      detail: "", 
      selectable: true 
    };
    setForm({ ...form, nodes: [...(form.nodes || []), newNode] });
    setTimeout(() => {
      onNodeSelect(newId);
    }, 0);
  };

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
    const nodeIds = (form.nodes || []).map(n => n.id).filter(Boolean);
    const newConn = { 
      from: nodeIds[0] || "", 
      to: nodeIds[1] || "", 
      sourceHandle: "", 
      targetHandle: "", 
      edgeStyle: "default", 
      edgeType: "default" 
    };
    setForm({ ...form, connections: [...(form.connections || []), newConn] });
  };

  const handleNodePositionsChange = (newPositions) => {
    setForm({ ...form, nodePositions: newPositions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    
    onSave({ ...form, nodePositions: cleanedNodePositions });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '' },
    { id: 'nodes', label: 'Nodes', icon: '' },
    { id: 'connections', label: 'Connections', icon: '' },
    { id: 'positions', label: 'Positions', icon: '' }
  ];

  // Node list for table
  const nodeList = form.nodes || [];

  return (
    <div className="workflow-container">
      {/* Editor Panel */}
      <div className="workflow-editor-panel">
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4em', fontWeight: '700' }}>
            {form._id ? "Edit Workflow" : "Create Workflow"}
          </h3>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`cms-btn cms-btn-small ${activeTab === tab.id ? 'cms-btn-primary' : 'cms-btn-secondary'}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ borderRadius: '8px 8px 0 0' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div>
              <div className="cms-form-group">
                <label className="cms-form-label">Workflow Name*</label>
                <input 
                  className="cms-form-input"
                  value={form.name || ""} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Enter workflow name"
                  required 
                />
              </div>
              
              <div className="cms-form-group">
                <label className="cms-form-label">Status</label>
                <select 
                  className="cms-form-select"
                  value={form.status || "Verified"} 
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Verified">Verified</option>
                  <option value="Researching">Researching</option>
                  <option value="Out of Scope">Out of Scope</option>
                </select>
              </div>
              
              <div className="cms-form-group">
                <label className="cms-form-label">Description</label>
                <textarea 
                  className="cms-form-textarea"
                  value={form.description || ""} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0 }}>Nodes ({(form.nodes || []).length})</h4>
                <button 
                  type="button" 
                  className="cms-btn cms-btn-success cms-btn-small"
                  onClick={handleNodeAdd}
                >
                  Add Node
                </button>
              </div>
              
              {/* Node List Table with Pagination */}
              <NodeListTable
                nodes={nodeList}
                onSelect={id => {
                  onNodeSelect(id);
                  // Will open popup via effect
                }}
                selectedNodeId={selectedNodeId}
                page={nodeListPage}
                setPage={setNodeListPage}
                pageSize={20}
              />

              {/* Node Editor Popup */}
              {showNodeEditor && editingNodeIdx !== null && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.25)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={closeNodeEditor}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                      minWidth: 400,
                      maxWidth: 520,
                      padding: 24,
                      position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'none',
                        border: 'none',
                        fontSize: 20,
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                      onClick={closeNodeEditor}
                      type="button"
                      aria-label="Close"
                    >×</button>
                    <NodeEditor
                      node={form.nodes[editingNodeIdx]}
                      onChange={newNode => handleNodeChange(editingNodeIdx, newNode)}
                      onRemove={() => handleNodeRemove(editingNodeIdx)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0 }}>Connections ({(form.connections || []).length})</h4>
                <button 
                  type="button" 
                  className="cms-btn cms-btn-success cms-btn-small"
                  onClick={handleConnAdd}
                  disabled={(form.nodes || []).length < 2}
                >
                  Add Connection
                </button>
              </div>
              
              {(form.nodes || []).length < 2 && (
                <div className="cms-message cms-message-info">
                  You need at least 2 nodes to create connections. Add more nodes first!
                </div>
              )}
              
              {(form.connections || []).length === 0 ? (
                <div className="cms-empty-state">
                  <div style={{ fontSize: '2em', marginBottom: '12px' }}>No connections</div>
                  <div>No connections yet. Connect your nodes to create workflow paths!</div>
                </div>
              ) : (
                (form.connections || []).map((conn, idx) => (
                  <ConnectionEditor
                    key={idx}
                    conn={conn}
                    onChange={newConn => handleConnChange(idx, newConn)}
                    onRemove={() => handleConnRemove(idx)}
                    allNodeIds={(form.nodes || []).map(n => n.id).filter(Boolean)}
                  />
                ))
              )}
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <NodePositionsEditor
              nodePositions={form.nodePositions || {}}
              onChange={handleNodePositionsChange}
              allNodeIds={(form.nodes || []).map(n => n.id).filter(Boolean)}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
            />
          )}

          {/* Action Buttons */}
          <div style={{ 
            marginTop: '32px', 
            paddingTop: '24px', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px'
          }}>
            <button type="submit" className="cms-btn cms-btn-primary">
              {form._id ? 'Update Workflow' : 'Create Workflow'}
            </button>
            <button 
              type="button" 
              className="cms-btn cms-btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Preview Panel */}
      <WorkflowPreview
        nodes={form.nodes || []}
        connections={form.connections || []}
        nodePositions={form.nodePositions || {}}
        onNodePositionChange={handleNodePositionChange}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
      />
    </div>
  );
}

export default WorkflowEditor;