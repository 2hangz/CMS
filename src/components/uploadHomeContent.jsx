// uploadHomeContent.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from './navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/markdown';

/** ---------- utils ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeParseJSON(s, fallback = {}) {
  try {
    const v = JSON.parse(s);
    if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    return fallback;
  } catch {
    return fallback;
  }
}

function stringifyKV(obj) {
  return JSON.stringify(obj ?? {}, null, 2);
}

// 数据验证函数
function validateSectionData(data) {
  const errors = [];
  
  // 验证 sectionIndex
  if (typeof data.sectionIndex !== 'number' || !Number.isInteger(data.sectionIndex)) {
    errors.push('sectionIndex must be an integer');
  }
  
  // 验证 content
  if (typeof data.content !== 'string') {
    errors.push('content must be a string');
  }
  
  // 验证 title (可选)
  if (data.title !== undefined && typeof data.title !== 'string') {
    errors.push('title must be a string');
  }
  
  // 验证 type (可选)
  if (data.type !== undefined && typeof data.type !== 'string') {
    errors.push('type must be a string');
  }
  
  // 验证 type 是否在允许的枚举值中
  if (data.type && !['text', 'key-value', 'image'].includes(data.type)) {
    errors.push('type must be one of: text, key-value, image');
  }
  
  return errors;
}

// 清理数据函数
function sanitizeSectionData(data) {
  return {
    sectionIndex: parseInt(data.sectionIndex, 10),
    title: String(data.title || '').trim(),
    type: String(data.type || 'text'),
    content: String(data.content || '').trim()
  };
}

/** ---------- component ---------- */
const CMSContentEditor = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIdx, setSavingIdx] = useState(null);
  const [deletingIdx, setDeletingIdx] = useState(null);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info'); // 'info' | 'success' | 'error'
  const [expanded, setExpanded] = useState(new Set());

  const showMessage = useCallback((text, type = 'info', duration = 4000) => {
    setMsg(text);
    setMsgType(type);
    if (duration > 0) {
      setTimeout(() => setMsg(''), duration);
    }
  }, []);

  /** Load all sections */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(BASE_API);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to load sections (${res.status})`);
        }
        const data = await res.json();
        const sorted = [...data].sort((a, b) => a.sectionIndex - b.sectionIndex);
        setSections(sorted);
        // expand first by default
        if (sorted.length > 0) setExpanded(new Set([0]));
      } catch (e) {
        showMessage(e.message || 'Failed to load content sections', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showMessage]);

  /** Helpers */
  const nextSectionIndex = useMemo(() => {
    if (!sections.length) return 1;
    return Math.max(...sections.map((s) => Number(s.sectionIndex) || 0)) + 1;
  }, [sections]);

  const updateLocal = useCallback((idx, key, value) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }, []);

  /** Expand / Collapse */
  const toggleSection = (idx) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  };
  const expandAll = () => setExpanded(new Set(sections.map((_, i) => i)));
  const collapseAll = () => setExpanded(new Set());

  /** Save (PUT) */
  const handleSave = async (idx) => {
    const s = sections[idx];
    if (!s || !s._id) {
      showMessage('Invalid section id.', 'error');
      return;
    }
    
    setSavingIdx(idx);
    try {
      // 清理和验证数据
      const cleanData = sanitizeSectionData({
        title: s.title,
        type: s.type,
        content: s.content
      });
      
      const validationErrors = validateSectionData({
        ...cleanData,
        sectionIndex: s.sectionIndex // 不需要清理现有的 sectionIndex
      });
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      console.log('Sending data:', cleanData); // 调试日志
      
      const res = await fetch(`${BASE_API}/${s._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cleanData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Save failed (${res.status})` };
        }
        throw new Error(errorData.error || errorData.message || `Save failed (${res.status})`);
      }
      
      const updated = await res.json();
      setSections((prev) => {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      });
      showMessage(
        `Saved: ${updated.title || `Section ${updated.sectionIndex}`}`,
        'success'
      );
    } catch (e) {
      console.error('Save error:', e);
      showMessage(e.message || 'Failed to save section', 'error');
    } finally {
      setSavingIdx(null);
    }
  };

  /** Delete (DELETE) */
  const handleDelete = async (idx) => {
    const s = sections[idx];
    if (!s || !s._id) return;
    if (!window.confirm(`Delete "${s.title || `Section ${s.sectionIndex}`}"? This cannot be undone.`)) {
      return;
    }
    setDeletingIdx(idx);
    try {
      const res = await fetch(`${BASE_API}/${s._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Delete failed (${res.status})`);
      }
      // update UI
      setSections((prev) => prev.filter((_, i) => i !== idx));
      // fix expanded indices after deletion
      setExpanded((prev) => {
        const remapped = new Set();
        [...prev].forEach((i) => {
          if (i < idx) remapped.add(i);
          else if (i > idx) remapped.add(i - 1);
        });
        return remapped;
      });
      showMessage('Section deleted.', 'success');
    } catch (e) {
      showMessage(e.message || 'Failed to delete section', 'error');
    } finally {
      setDeletingIdx(null);
    }
  };

  /** Add (POST) */
  const handleAdd = async () => {
    const payload = sanitizeSectionData({
      sectionIndex: nextSectionIndex,
      title: '',
      type: 'text',
      content: '',
    });
    
    const validationErrors = validateSectionData(payload);
    if (validationErrors.length > 0) {
      showMessage(`Validation failed: ${validationErrors.join(', ')}`, 'error');
      return;
    }
    
    try {
      console.log('Creating section with data:', payload); // 调试日志
      
      const res = await fetch(BASE_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Add failed (${res.status})` };
        }
        throw new Error(errorData.error || errorData.message || `Add failed (${res.status})`);
      }
      
      const created = await res.json();
      setSections((prev) => {
        const arr = [...prev, created].sort((a, b) => a.sectionIndex - b.sectionIndex);
        return arr;
      });
      // expand the newly created card
      await sleep(50);
      setExpanded((prev) => {
        const newIdx = sections.length; // appended to end before sort; safe to expand all then narrow
        const n = new Set(prev);
        // find its current index after sort
        const idxNow = sections
          .concat([created])
          .sort((a, b) => a.sectionIndex - b.sectionIndex)
          .findIndex((s) => s._id === created._id);
        n.add(idxNow);
        return n;
      });
      showMessage('Section added.', 'success');
    } catch (e) {
      console.error('Add error:', e);
      showMessage(e.message || 'Failed to add section', 'error');
    }
  };

  /** Key-Value handlers */
  const getKV = (content) => safeParseJSON(content || '{}', {});
  const setKV = (idx, kv) => updateLocal(idx, 'content', stringifyKV(kv));

  const addKVField = (idx) => {
    const kv = getKV(sections[idx]?.content);
    let base = 'New Field';
    let name = base;
    let c = 1;
    while (Object.prototype.hasOwnProperty.call(kv, name)) {
      name = `${base} ${c++}`;
    }
    kv[name] = 'New Value';
    setKV(idx, kv);
  };

  const changeKVKey = (idx, oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    const kv = getKV(sections[idx]?.content);
    if (Object.prototype.hasOwnProperty.call(kv, newKey)) {
      return; // avoid key collision
    }
    kv[newKey] = kv[oldKey];
    delete kv[oldKey];
    setKV(idx, kv);
  };

  const changeKVValue = (idx, key, value) => {
    const kv = getKV(sections[idx]?.content);
    kv[key] = value;
    setKV(idx, kv);
  };

  const removeKVField = (idx, key) => {
    const kv = getKV(sections[idx]?.content);
    delete kv[key];
    setKV(idx, kv);
  };

  if (loading) {
    return (
      <div className="cms-layout">
        <Navbar />
        <div className="cms-main-content">
          <div className="cms-loading">
            <div className="cms-spinner" />
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
          <p className="page-subtitle">Manage homepage blocks with text, key-value, or image content.</p>
        </div>

        {msg && (
          <div className={`cms-message cms-message-${msgType}`}>
            {msg}
          </div>
        )}

        {/* Bulk actions */}
        <div className="cms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Content Sections ({sections.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cms-btn cms-btn-secondary cms-btn-small" onClick={expandAll}>
                Expand All
              </button>
              <button className="cms-btn cms-btn-secondary cms-btn-small" onClick={collapseAll}>
                Collapse All
              </button>
              <button className="cms-btn cms-btn-success cms-btn-small" onClick={handleAdd}>
                Add Section
              </button>
            </div>
          </div>
        </div>

        {/* Section list */}
        {sections.map((s, idx) => {
          const isOpen = expanded.has(idx);
          const saving = savingIdx === idx;
          const deleting = deletingIdx === idx;

          const typeBadge = (() => {
            const map = {
              text: { bg: '#dbeafe', fg: '#1e40af', label: 'Text' },
              'key-value': { bg: '#f0fdf4', fg: '#166534', label: 'Key-Value' },
              image: { bg: '#fef3c7', fg: '#92400e', label: 'Image' },
            };
            return map[s.type] || map.text;
          })();

          const kvObj = s.type === 'key-value' ? getKV(s.content) : {};

          return (
            <div key={s._id} className="cms-card">
              {/* header */}
              <div
                onClick={() => toggleSection(idx)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.8em',
                      fontWeight: 600,
                      minWidth: 60,
                      textAlign: 'center',
                    }}
                  >
                    #{s.sectionIndex}
                  </span>
                  <h4 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title || `Section ${s.sectionIndex}`}
                  </h4>
                  <span
                    style={{
                      background: typeBadge.bg,
                      color: typeBadge.fg,
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: '0.75em',
                      fontWeight: 500,
                    }}
                  >
                    {typeBadge.label}
                  </span>
                </div>
                <span
                  style={{
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    fontSize: '1.2em',
                  }}
                >
                  ▶
                </span>
              </div>

              {/* body */}
              {isOpen && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <div className="cms-form-group">
                    <label className="cms-form-label">Section Title</label>
                    <input
                      type="text"
                      className="cms-form-input"
                      placeholder={`Section ${s.sectionIndex} Title`}
                      value={s.title || ''}
                      onChange={(e) => updateLocal(idx, 'title', e.target.value)}
                    />
                  </div>

                  <div className="cms-form-group">
                    <label className="cms-form-label">Content Type</label>
                    <select
                      className="cms-form-select"
                      value={s.type || 'text'}
                      onChange={(e) => updateLocal(idx, 'type', e.target.value)}
                    >
                      <option value="text">Text Content</option>
                      <option value="key-value">Key-Value Pairs</option>
                      <option value="image">Image URL</option>
                    </select>
                  </div>

                  {/* Text */}
                  {s.type === 'text' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Text Content</label>
                      <textarea
                        className="cms-form-textarea"
                        rows={6}
                        value={s.content || ''}
                        placeholder="Markdown supported..."
                        onChange={(e) => updateLocal(idx, 'content', e.target.value)}
                      />
                      <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: 4 }}>
                        Supports markdown formatting for rich text.
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {s.type === 'image' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Image URL</label>
                      <input
                        type="url"
                        className="cms-form-input"
                        placeholder="https://example.com/banner.jpg"
                        value={s.content || ''}
                        onChange={(e) => updateLocal(idx, 'content', e.target.value)}
                      />
                      {s.content && (
                        <div style={{ marginTop: 12 }}>
                          <img
                            src={s.content}
                            alt="Preview"
                            style={{
                              maxWidth: 220,
                              maxHeight: 140,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key-Value */}
                  {s.type === 'key-value' && (
                    <div className="cms-form-group">
                      <label className="cms-form-label">Key-Value Pairs</label>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 16,
                        }}
                      >
                        {Object.keys(kvObj).length === 0 ? (
                          <div
                            style={{
                              textAlign: 'center',
                              padding: 20,
                              color: '#64748b',
                              fontStyle: 'italic',
                            }}
                          >
                            No key-value pairs yet. Click "Add Field" to start!
                          </div>
                        ) : (
                          Object.entries(kvObj).map(([k, v], i) => (
                            <div
                              key={k + i}
                              style={{
                                display: 'flex',
                                gap: 12,
                                marginBottom: 12,
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <input
                                  className="cms-form-input"
                                  value={k}
                                  onChange={(e) => changeKVKey(idx, k, e.target.value)}
                                  placeholder="Key"
                                  style={{ marginBottom: 0 }}
                                />
                              </div>
                              <div style={{ flex: 2 }}>
                                <input
                                  className="cms-form-input"
                                  value={String(v)}
                                  onChange={(e) => changeKVValue(idx, k, e.target.value)}
                                  placeholder="Value"
                                  style={{ marginBottom: 0 }}
                                />
                              </div>
                              <button
                                type="button"
                                className="cms-btn cms-btn-danger cms-btn-small"
                                onClick={() => removeKVField(idx, k)}
                                title="Remove this field"
                              >
                                Delete
                              </button>
                            </div>
                          ))
                        )}
                        <button
                          type="button"
                          className="cms-btn cms-btn-success cms-btn-small"
                          onClick={() => addKVField(idx)}
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                      Changes are saved per section.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="cms-btn cms-btn-primary"
                        disabled={saving || deleting}
                        onClick={() => handleSave(idx)}
                      >
                        {saving ? 'Saving…' : 'Save Section'}
                      </button>
                      <button
                        type="button"
                        className="cms-btn cms-btn-danger"
                        disabled={deleting || saving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                        title="Delete this section"
                      >
                        {deleting ? 'Deleting…' : 'Delete Section'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && !loading && (
          <div className="cms-card">
            <div className="cms-empty-state">
              <div style={{ fontSize: '3em', marginBottom: 16 }}>🗂️</div>
              <div>No content sections found.</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: 8 }}>
                Click "Add Section" to create your first block.
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="cms-card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>Content Type Guide</h4>
          <div style={{ fontSize: '0.9em', color: '#1e40af', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Text:</strong> Paragraphs, descriptions, markdown content.
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Key-Value:</strong> Structured data like features, stats, contacts.
            </div>
            <div>
              <strong>Image:</strong> Store image URLs for banners, logos, illustrations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSContentEditor;