import React, { useEffect, useState } from 'react';
import Navbar from './navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/markdown';

const CMSContentEditor = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);

  useEffect(() => {
    fetch(BASE_API)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.sectionIndex - b.sectionIndex);
        setSections(sorted);
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
    handleChange(idx, 'content', JSON.stringify(kv));
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
    // Ensure we don't overwrite an existing "New Field"
    let newFieldName = 'New Field';
    let counter = 1;
    while (kv.hasOwnProperty(newFieldName)) {
      newFieldName = `New Field ${counter++}`;
    }
    kv[newFieldName] = 'New Value';
    handleChange(idx, 'content', JSON.stringify(kv));
  };

  const handleSave = (idx) => {
    const section = sections[idx];
    setSavingIndex(idx);
    fetch(`${BASE_API}/${section._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: section.title,
        type: section.type,
        content: section.content
      })
    })
      .then(res => res.json())
      .then(() => {
        setSavingIndex(null);
        alert(`Section ${section.sectionIndex} saved.`);
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Navbar />
      <h1>CMS Content Editor</h1>
      {sections.map((section, idx) => (
        <div key={section._id} style={{ marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
          <input
            type="text"
            placeholder="Section Title"
            value={section.title || ''}
            onChange={e => handleChange(idx, 'title', e.target.value)}
            style={{ width: '100%', fontSize: '18px', marginBottom: '10px' }}
          />

          <select
            value={section.type || 'text'}
            onChange={e => handleChange(idx, 'type', e.target.value)}
            style={{ marginBottom: '10px' }}
          >
            <option value="text">Text</option>
            <option value="key-value">Key-Value</option>
            <option value="image">Image</option>
          </select>

          {section.type === 'text' && (
            <textarea
              value={section.content || ''}
              onChange={e => handleChange(idx, 'content', e.target.value)}
              style={{ width: '100%', minHeight: '150px', fontSize: '16px', padding: '10px' }}
            />
          )}

          {section.type === 'image' && (
            <input
              type="text"
              placeholder="Image URL"
              value={section.content || ''}
              onChange={e => handleChange(idx, 'content', e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          )}

          {section.type === 'key-value' && (
            <div>
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
                return Object.entries(kv).map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input
                      value={k}
                      onChange={e => handleKeyValueChange(idx, i, 'key', e.target.value)}
                      style={{ flex: 1, padding: '6px' }}
                    />
                    <input
                      value={v}
                      onChange={e => handleKeyValueChange(idx, i, 'value', e.target.value)}
                      style={{ flex: 2, padding: '6px' }}
                    />
                  </div>
                ));
              })()}
              <button onClick={() => addKeyValueField(idx)}>➕ Add Field</button>
            </div>
          )}

          <button
            onClick={() => handleSave(idx)}
            disabled={savingIndex === idx}
            style={{ marginTop: '10px', background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px' }}
          >
            {savingIndex === idx ? 'Saving...' : 'Save Section'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default CMSContentEditor;
