import React, { useRef, useState } from "react";

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
    formData.append("name", "icon-upload");
  
    try {
      const res = await fetch("https://entyre-backend.onrender.com/api/upload-icon", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.fileUrl) {
        update("icon", data.fileUrl);
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
    <div className="workflow-node-editor">
      <div className="workflow-node-row">
        <div className="workflow-input-group">
          <label className="cms-form-label">ID*</label>
          <input 
            className="cms-form-input workflow-input-medium" 
            value={node.id || ""} 
            onChange={e => update("id", e.target.value)} 
            placeholder="node-1"
            required 
          />
        </div>
        
        <div className="workflow-input-group">
          <label className="cms-form-label">Label</label>
          <input 
            className="cms-form-input workflow-input-medium" 
            value={node.label || ""} 
            onChange={e => update("label", e.target.value)}
            placeholder="Display name"
          />
        </div>
        
        <div className="workflow-input-group">
          <label className="cms-form-label">Type</label>
          <select 
            className="cms-form-select workflow-input-medium" 
            value={node.type || "iconNode"} 
            onChange={e => update("type", e.target.value)}
          >
            <option value="iconNode">Connected Node</option>
            <option value="backgroundImage">Background Image</option>
          </select>
        </div>

        <div className="workflow-input-group">
          <label className="cms-form-label">
            <input 
              type="checkbox" 
              checked={!!node.selectable} 
              onChange={e => update("selectable", e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Selectable
          </label>
        </div>
      </div>

      <div className="workflow-node-row">
        <div className="workflow-input-group" style={{ flex: 1 }}>
          <label className="cms-form-label">Icon URL</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              className="cms-form-input"
              value={node.icon || ""}
              onChange={e => update("icon", e.target.value)}
              placeholder="https://example.com/icon.png"
              style={{ flex: 1 }}
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
              className="cms-btn cms-btn-secondary cms-btn-small"
              onClick={() => fileInputRef.current?.click()}
              disabled={iconUploading}
            >
              {iconUploading ? "Uploading..." : "Upload"}
            </button>
            {node.icon && (
              <img 
                src={node.icon} 
                alt="icon preview" 
                style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #e2e8f0' }}
              />
            )}
          </div>
          {iconUploadError && (
            <div style={{ color: '#ef4444', fontSize: '0.85em', marginTop: '4px' }}>
              {iconUploadError}
            </div>
          )}
        </div>
      </div>

      <div className="workflow-node-row">
        <div className="workflow-input-group" style={{ flex: 1 }}>
          <label className="cms-form-label">Detail</label>
          <input 
            className="cms-form-input" 
            value={node.detail || ""} 
            onChange={e => update("detail", e.target.value)}
            placeholder="Additional information about this node"
          />
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

export default NodeEditor;