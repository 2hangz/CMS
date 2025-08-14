
import React from "react";

function ConnectionEditor({ conn, onChange, onRemove, allNodeIds = [] }) {
    const update = (key, value) => onChange({ ...conn, [key]: value });
  
    return (
      <div className="workflow-connection-editor">
        <div className="workflow-node-row">
          <div className="workflow-input-group">
            <label className="cms-form-label">From Node*</label>
            <select
              className="cms-form-select workflow-input-medium"
              value={conn.from || ""}
              onChange={e => update("from", e.target.value)}
              required
            >
              <option value="">Select source...</option>
              {allNodeIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          
          <div className="workflow-input-group">
            <label className="cms-form-label">To Node*</label>
            <select
              className="cms-form-select workflow-input-medium"
              value={conn.to || ""}
              onChange={e => update("to", e.target.value)}
              required
            >
              <option value="">Select target...</option>
              {allNodeIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
  
          <div className="workflow-input-group">
            <label className="cms-form-label">Source Handle</label>
            <select
              className="cms-form-select workflow-input-small"
              value={conn.sourceHandle || ""}
              onChange={e => update("sourceHandle", e.target.value)}
            >
              <option value="">Auto</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
  
          <div className="workflow-input-group">
            <label className="cms-form-label">Target Handle</label>
            <select
              className="cms-form-select workflow-input-small"
              value={conn.targetHandle || ""}
              onChange={e => update("targetHandle", e.target.value)}
            >
              <option value="">Auto</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
  
        <div className="workflow-node-row">
          <div className="workflow-input-group">
            <label className="cms-form-label">Edge Style</label>
            <select
              className="cms-form-select workflow-input-medium"
              value={conn.edgeStyle || ""}
              onChange={e => update("edgeStyle", e.target.value)}
            >
              <option value="">Default</option>
              <option value="redDashed">Red Dashed</option>
              <option value="redSolid">Red Solid</option>
              <option value="grayDashed">Gray Dashed</option>
              <option value="blueBold">Blue Bold</option>
            </select>
          </div>
          
          <div className="workflow-input-group">
            <label className="cms-form-label">Edge Type</label>
            <select
              className="cms-form-select workflow-input-medium"
              value={conn.edgeType || ""}
              onChange={e => update("edgeType", e.target.value)}
            >
              <option value="">Default</option>
              <option value="step">Step</option>
              <option value="default">Curve</option>
              <option value="customPolyline">Custom Polyline</option>
            </select>
          </div>
  
          <button 
            type="button" 
            className="cms-btn cms-btn-danger cms-btn-small" 
            onClick={onRemove}
            style={{ alignSelf: 'end' }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }
  
  export default ConnectionEditor;