import React, { useEffect, useState } from 'react';
import Navbar from './navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/markdown';

const CMSContentEditor = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [expandedSections, setExpandedSections] = useState(new Set());

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetch(BASE_API)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.sectionIndex - b.sectionIndex);
        setSections(sorted);
        setLoading(false);
        // Expand first section by default
        if (sorted.length > 0) {
          setExpandedSections(new Set([0]));
        }
      })
      .catch(err => {
        showMessage('Failed to load content sections', 'error');
        setLoading(false);
      });
  }, []);

  const handleChange = (idx, key, value) => {
    const updated = [...sections];
    updated[idx][key] = value;
    setSections(updated);
  };

  const handleKeyValueChange = (idx, subIdx, field, val) => {
    let kv;
    try {
      kv = JSON.parse(sections[idx].content || '{}');
      if (typeof kv !== 'object' || kv === null || Array.isArray(kv)) {
        kv = {};
      }
    } catch (e) {
      kv = {};
    }
    
    const keys = Object.keys(kv);
    if (field === 'key') {
      const oldKey = keys[subIdx];
      const value = kv[oldKey];
      delete kv[oldKey];
      kv[val] = value;
    } else {
      kv[keys[subIdx]] = val;
    }
    handleChange(idx, 'content', JSON.stringify(kv, null, 2));
  };

  const addKeyValueField = (idx) => {
    let kv;
    try {
      kv = JSON.parse(sections[idx].content || '{}');
      if (typeof kv !== 'object' || kv === null || Array.isArray(kv)) {
        kv = {};
      }
    } catch (e) {
      kv = {};
    }
    
    let newFieldName = 'New Field';
    let counter = 1;
    while (kv.hasOwnProperty(newFieldName)) {
      newFieldName = `New Field ${counter++}`;
    }
    kv[newFieldName] = 'New Value';
    handleChange(idx, 'content', JSON.stringify(kv, null, 2));
  };

  const removeKeyValueField = (idx, fieldKey) => {
    let kv;
    try {
      kv = JSON.parse(sections[idx].content || '{}');
      if (typeof kv !== 'object' || kv === null || Array.isArray(kv)) {
        kv = {};
      }
    } catch (e) {
      kv = {};
    }
    
    delete kv[fieldKey];
    handleChange(idx, 'content', JSON.stringify(kv, null, 2));
  };

  const handleSave = async (idx) => {
    const section = sections[idx];
    setSavingIndex(idx);
    
    try {
      const res = await fetch(`${BASE_API}/${section._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: section.title,
          type: section.type,
          content: section.content
        })
      });
      
      if (!res.ok) throw new Error('Failed to save section');
      
      showMessage(`Section "${section.title || `Section ${section.sectionIndex}`}" saved successfully!`, 'success');
    } catch (err) {
      showMessage('Failed to save section. Please try again.', 'error');
    } finally {
      setSavingIndex(null);
    }
  };

  const toggleSection = (idx) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((_, idx) => idx)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  if (loading) {
    return (
      <div className="cms-layout">
        <Navbar />
        <div className="cms-main-content">
          <div className="cms-loading">
            <div className="cms-spinner"></div>
            Loading content sections...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-layout">
      <Navbar />
      <div className="cms-main-content">
        <div className="page-header">
          <h1 className="page-title">Homepage Content Editor</h1>
          <p className="page-subtitle">Manage your homepage content sections with different content types</p>
        </div>

        {message && (
          <div className={`cms-message cms-message-${messageType}`}>
            {messageType === 'success' && ''}
            {messageType === 'error' && ''}
            {messageType === 'info' && ''}
            {message}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="cms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Content Sections ({sections.length})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="cms-btn cms-btn-secondary cms-btn-small"
                onClick={expandAll}
              >
                Expand All
              </button>
              <button 
                className="cms-btn cms-btn-secondary cms-btn-small"
                onClick={collapseAll}
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => {
          const isExpanded = expandedSections.has(idx);
          const isSaving = savingIndex === idx;
          
          return (
            <div key={section._id} className="cms-card">
              {/* Section Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
                onClick={() => toggleSection(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    background: '#f1f5f9', 
                    color: '#475569',
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    fontSize: '0.8em',
                    fontWeight: '600',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    #{section.sectionIndex}
                  </span>
                  <h4 style={{ margin: 0, flex: 1 }}>
                    {section.title || `Section ${section.sectionIndex}`}
                  </h4>
                  <span style={{
                    background: section.type === 'text' ? '#dbeafe' : section.type === 'key-value' ? '#f0fdf4' : '#fef3c7',
                    color: section.type === 'text' ? '#1e40af' : section.type === 'key-value' ? '#166534' : '#92400e',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75em',
                    fontWeight: '500'
                  }}>
                    {section.type === 'text' && 'Text'}
                    {section.type === 'key-value' && 'Key-Value'}
                    {section.type === 'image' && 'Image'}
                  </span>
                </div>
                <span style={{ 
                  transition: 'transform 0.2s', 
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  fontSize: '1.2em'
                }}>
                  ▶
                </span>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <div className="cms-form-group">
                    <label className="cms-form-label">Section Title</label>
                    <input
                      type="text"
                      placeholder={`Section ${section.sectionIndex} Title`}
                      value={section.title || ''}
                      onChange={e => handleChange(idx, 'title', e.target.value)}
                      className="cms-form-input"
                    />
                  </div>

                  <div className="cms-form-group">
                    <label className="cms-form-label">Content Type</label>
                    <select
                      value={section.type || 'text'}
                      onChange={e => handleChange(idx, 'type', e.target.value)}
                      className="cms-form-select"
                    >
                      <option value="text">Text Content</option>
                      <option value="key-value">Key-Value Pairs</option>
                      <option value="image">Image URL</option>
                    </select>
                  </div>

                  {/* Text Content */}
                  {section.type === 'text' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Text Content</label>
                      <textarea
                        value={section.content || ''}
                        onChange={e => handleChange(idx, 'content', e.target.value)}
                        className="cms-form-textarea"
                        rows={6}
                        placeholder="Enter your text content here. You can use markdown formatting..."
                      />
                      <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '4px' }}>
                        Supports markdown formatting for rich text display
                      </div>
                    </div>
                  )}

                  {/* Image Content */}
                  {section.type === 'image' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={section.content || ''}
                        onChange={e => handleChange(idx, 'content', e.target.value)}
                        className="cms-form-input"
                      />
                      {section.content && (
                        <div style={{ marginTop: '12px' }}>
                          <img
                            src={section.content}
                            alt="Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key-Value Content */}
                  {section.type === 'key-value' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Key-Value Pairs</label>
                      <div style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '16px' 
                      }}>
                        {(() => {
                          let kv;
                          try {
                            kv = JSON.parse(section.content || '{}');
                            if (typeof kv !== 'object' || kv === null || Array.isArray(kv)) {
                              kv = {};
                            }
                          } catch (e) {
                            kv = {};
                          }
                          
                          const entries = Object.entries(kv);
                          
                          return (
                            <>
                              {entries.length === 0 ? (
                                <div style={{ 
                                  textAlign: 'center', 
                                  padding: '20px', 
                                  color: '#64748b',
                                  fontStyle: 'italic'
                                }}>
                                  No key-value pairs yet. Click "Add Field" to start!
                                </div>
                              ) : (
                                entries.map(([k, v], i) => (
                                  <div key={i} style={{ 
                                    display: 'flex', 
                                    gap: '12px', 
                                    marginBottom: '12px',
                                    alignItems: 'center'
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <input
                                        value={k}
                                        onChange={e => handleKeyValueChange(idx, i, 'key', e.target.value)}
                                        placeholder="Key"
                                        className="cms-form-input"
                                        style={{ marginBottom: 0 }}
                                      />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                      <input
                                        value={v}
                                        onChange={e => handleKeyValueChange(idx, i, 'value', e.target.value)}
                                        placeholder="Value"
                                        className="cms-form-input"
                                        style={{ marginBottom: 0 }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="cms-btn cms-btn-danger cms-btn-small"
                                      onClick={() => removeKeyValueField(idx, k)}
                                      title="Remove this field"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              )}
                              <button 
                                type="button"
                                className="cms-btn cms-btn-success cms-btn-small"
                                onClick={() => addKeyValueField(idx)}
                              >
                                Add Field
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div style={{ 
                    marginTop: '24px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                      Changes are saved individually for each section
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSave(idx)}
                      disabled={isSaving}
                      className="cms-btn cms-btn-primary"
                    >
                      {isSaving ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && !loading && (
          <div className="cms-card">
            <div className="cms-empty-state">
              <div style={{ fontSize: '3em', marginBottom: '16px' }}></div>
              <div>No content sections found.</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '8px' }}>
                Contact your administrator to set up content sections.
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="cms-card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>Content Type Guide</h4>
          <div style={{ fontSize: '0.9em', color: '#1e40af', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Text:</strong> Use for paragraphs, descriptions, and markdown content
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Key-Value:</strong> Perfect for structured data like features, stats, or contact info
            </div>
            <div>
              <strong>Image:</strong> Store image URLs for banners, logos, or illustrations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSContentEditor;