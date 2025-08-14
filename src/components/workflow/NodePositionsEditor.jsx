
import React, { useEffect, useState } from "react";

function NodePositionsEditor({ nodePositions, onChange, allNodeIds = [], selectedNodeId, onNodeSelect }) {
  const [editingId, setEditingId] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  // Auto-fill when selecting a node
  useEffect(() => {
    if (selectedNodeId && nodePositions[selectedNodeId]) {
      setEditingId(selectedNodeId);
      setX(nodePositions[selectedNodeId].x.toString());
      setY(nodePositions[selectedNodeId].y.toString());
    }
  }, [selectedNodeId, nodePositions]);

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

  const handleBatchPosition = (layout) => {
    const newPositions = { ...nodePositions };
    const nodeIds = allNodeIds.filter(id => id);
    
    if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(nodeIds.length));
      nodeIds.forEach((id, idx) => {
        newPositions[id] = {
          x: (idx % cols) * 120 + 20,
          y: Math.floor(idx / cols) * 100 + 20
        };
      });
    } else if (layout === 'line') {
      nodeIds.forEach((id, idx) => {
        newPositions[id] = { x: idx * 140 + 20, y: 50 };
      });
    } else if (layout === 'circle') {
      const center = { x: 200, y: 150 };
      const radius = 120;
      nodeIds.forEach((id, idx) => {
        const angle = (idx / nodeIds.length) * 2 * Math.PI;
        newPositions[id] = {
          x: center.x + radius * Math.cos(angle) - 40,
          y: center.y + radius * Math.sin(angle) - 20
        };
      });
    }
    
    onChange(newPositions);
  };

  return (
    <div className="workflow-positions-editor">
      <div className="cms-card-header">
        <h4 className="cms-card-title">Node Positions</h4>
      </div>

      {/* Batch Operations */}
      <div style={{ marginBottom: '16px' }}>
        <div className="cms-form-label">Quick Layouts:</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="cms-btn cms-btn-secondary cms-btn-small"
            onClick={() => handleBatchPosition('grid')}
          >
            Grid
          </button>
          <button 
            type="button" 
            className="cms-btn cms-btn-secondary cms-btn-small"
            onClick={() => handleBatchPosition('line')}
          >
            Line
          </button>
          <button 
            type="button" 
            className="cms-btn cms-btn-secondary cms-btn-small"
            onClick={() => handleBatchPosition('circle')}
          >
            Circle
          </button>
        </div>
      </div>

      {/* Existing Positions */}
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(nodePositions || {}).length === 0 ? (
          <div className="cms-empty-state" style={{ padding: '20px' }}>
            No positions set. Add positions below or drag nodes in preview.
          </div>
        ) : (
          Object.entries(nodePositions || {}).map(([id, pos]) => (
            <div key={id} className="workflow-position-item">
              <div>
                <span 
                  style={{ 
                    fontWeight: selectedNodeId === id ? '700' : '600',
                    color: selectedNodeId === id ? '#3b82f6' : '#1e293b',
                    cursor: 'pointer'
                  }}
                  onClick={() => onNodeSelect?.(id)}
                >
                  {id}
                </span>
                <div className="workflow-position-coords">
                  x: {pos.x}, y: {pos.y}
                </div>
              </div>
              <button 
                type="button" 
                className="cms-btn cms-btn-danger cms-btn-small" 
                onClick={() => handleRemove(id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add/Update Position */}
      <div className="workflow-add-position">
        <div className="workflow-input-group">
          <label className="cms-form-label">Node</label>
          <select 
            className="cms-form-select workflow-input-medium"
            value={editingId} 
            onChange={e => setEditingId(e.target.value)}
          >
            <option value="">Select node...</option>
            {allNodeIds.filter(id => id).map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        
        <div className="workflow-input-group">
          <label className="cms-form-label">X</label>
          <input 
            className="cms-form-input workflow-input-small" 
            type="number"
            placeholder="0" 
            value={x} 
            onChange={e => setX(e.target.value)} 
          />
        </div>
        
        <div className="workflow-input-group">
          <label className="cms-form-label">Y</label>
          <input 
            className="cms-form-input workflow-input-small" 
            type="number"
            placeholder="0" 
            value={y} 
            onChange={e => setY(e.target.value)} 
          />
        </div>
        
        <button 
          type="button" 
          className="cms-btn cms-btn-success cms-btn-small"
          onClick={handleAdd}
          style={{ alignSelf: 'end' }}
        >
          Set Position
        </button>
      </div>
    </div>
  );
}

export default NodePositionsEditor;