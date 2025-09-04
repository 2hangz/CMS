import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown, Eye, EyeOff, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const CMS = () => {
  const [sections, setSections] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({
    title: '',
    type: 'text',
    content: '',
    sectionIndex: 0,
    isVisible: true
  });
  const [activeTab, setActiveTab] = useState('sections');
  const [saveStatus, setSaveStatus] = useState(null);

  const baseApi = 'https://entyre-backend.onrender.com/api';

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check if user is authenticated
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuth()) return;
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load sections
      const sectionsResponse = await fetch(`${baseApi}/markdown`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (sectionsResponse.status === 401 || sectionsResponse.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        setSections(Array.isArray(sectionsData) ? sectionsData.sort((a, b) => a.sectionIndex - b.sectionIndex) : []);
      }

      // Load banners
      const bannersResponse = await fetch(`${baseApi}/banners`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (bannersResponse.status === 401 || bannersResponse.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (bannersResponse.ok) {
        const bannersData = await bannersResponse.json();
        setBanners(Array.isArray(bannersData) ? bannersData : []);
      }
    } catch (err) {
      console.error('Loading data failed:', err);
      setError(`Loading data failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showSaveStatus = (status, message) => {
    setSaveStatus({ status, message });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const validateSection = (section) => {
    if (!section.type) return 'Please select content type';
    if (section.type !== 'image' && !section.content.trim()) return 'Content cannot be empty';
    if (section.type === 'image' && !section.content.trim()) return 'Please enter image URL';
    if (section.type === 'key-value') {
      try {
        JSON.parse(section.content);
      } catch (e) {
        return 'Key-value format must be valid JSON';
      }
    }
    return null;
  };

  const handleAddSection = async () => {
    const validationError = validateSection(newSection);
    if (validationError) {
      showSaveStatus('error', validationError);
      return;
    }

    try {
      const sectionToAdd = {
        ...newSection,
        sectionIndex: sections.length,
        isVisible: newSection.isVisible !== false
      };

      const response = await fetch(`${baseApi}/markdown`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionToAdd),
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Add failed (${response.status}): ${errorData}`);
      }

      const createdSection = await response.json();
      setSections(prev => [...prev, createdSection].sort((a, b) => a.sectionIndex - b.sectionIndex));
      setNewSection({
        title: '',
        type: 'text',
        content: '',
        sectionIndex: 0,
        isVisible: true
      });
      showSaveStatus('success', 'Content added successfully');
    } catch (err) {
      console.error('Add content failed:', err);
      showSaveStatus('error', `Add failed: ${err.message}`);
    }
  };

  const handleUpdateSection = async (id, updatedSection) => {
    const validationError = validateSection(updatedSection);
    if (validationError) {
      showSaveStatus('error', validationError);
      return;
    }

    try {
      const response = await fetch(`${baseApi}/markdown/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSection),
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Update failed (${response.status}): ${errorData}`);
      }

      const updated = await response.json();
      setSections(prev => prev.map(s => s._id === id ? updated : s));
      setEditingSection(null);
      showSaveStatus('success', 'Content updated successfully');
    } catch (err) {
      console.error('Update content failed:', err);
      showSaveStatus('error', `Update failed: ${err.message}`);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`${baseApi}/markdown/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setSections(prev => prev.filter(s => s._id !== id));
      showSaveStatus('success', 'Content deleted successfully');
    } catch (err) {
      console.error('Delete content failed:', err);
      showSaveStatus('error', `Delete failed: ${err.message}`);
    }
  };

  const moveSection = async (id, direction) => {
    const currentIndex = sections.findIndex(s => s._id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    // Update sectionIndex
    newSections.forEach((section, index) => {
      section.sectionIndex = index;
    });

    try {
      // Batch update indices
      await Promise.all(
        newSections.map(section => 
          fetch(`${baseApi}/markdown/${section._id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(section),
            credentials: 'include'
          })
        )
      );

      setSections(newSections);
      showSaveStatus('success', 'Order updated');
    } catch (err) {
      console.error('Update order failed:', err);
      showSaveStatus('error', 'Update order failed');
    }
  };

  const SectionEditor = ({ section, onSave, onCancel, isNew = false }) => {
    const [editData, setEditData] = useState(section);

    const handleContentChange = (value) => {
      setEditData(prev => ({ ...prev, content: value }));
    };

    return (
      <div style={{
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Title
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter title (optional)"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type
            </label>
            <select
              value={editData.type}
              onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value, content: '' }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="text">Text Content</option>
              <option value="image">Image</option>
              <option value="key-value">Key-Value Pairs</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Content
          </label>
          {editData.type === 'text' && (
            <textarea
              value={editData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder="Enter Markdown formatted text content..."
            />
          )}
          {editData.type === 'image' && (
            <input
              type="url"
              value={editData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter image URL..."
            />
          )}
          {editData.type === 'key-value' && (
            <textarea
              value={editData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder='Enter JSON formatted key-value pairs, e.g.:\n{\n  "Project Name": "Description content",\n  "Start Date": "January 2024"\n}'
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={editData.isVisible !== false}
              onChange={(e) => setEditData(prev => ({ ...prev, isVisible: e.target.checked }))}
              id={`visible-${isNew ? 'new' : editData._id}`}
            />
            <label htmlFor={`visible-${isNew ? 'new' : editData._id}`} style={{ fontSize: '14px', color: '#6b7280' }}>
              Show this content
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={() => onSave(editData)}
              style={{
                padding: '8px 16px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003C69 0%, #006087 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem' }}>Entyre CMS</h1>
        <p style={{ margin: '0', fontSize: '1.1rem', opacity: '0.9' }}>Homepage Content Management System</p>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: saveStatus.status === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          {saveStatus.status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {saveStatus.message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setActiveTab('sections')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'sections' ? '#003C69' : 'white',
              color: activeTab === 'sections' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Content Management ({sections.length})
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'banners' ? '#003C69' : 'white',
              color: activeTab === 'banners' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Banner Management ({banners.length})
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div>
          {/* Add New Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#003C69',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Plus size={20} />
              Add New Content
            </h2>
            <SectionEditor
              section={newSection}
              onSave={handleAddSection}
              onCancel={() => setNewSection({
                title: '',
                type: 'text',
                content: '',
                sectionIndex: 0,
                isVisible: true
              })}
              isNew={true}
            />
          </div>

          {/* Existing Sections */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h2 style={{
                margin: '0',
                color: '#003C69',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Edit2 size={20} />
                Existing Content ({sections.length})
              </h2>
            </div>
            
            <div style={{ padding: '24px' }}>
              {sections.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <p>No content yet, click "Add New Content" above to start creating.</p>
                </div>
              ) : (
                sections.map((section, index) => (
                  <div key={section._id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    {editingSection === section._id ? (
                      <div style={{ padding: '16px' }}>
                        <SectionEditor
                          section={section}
                          onSave={(updatedSection) => handleUpdateSection(section._id, updatedSection)}
                          onCancel={() => setEditingSection(null)}
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          padding: '16px',
                          background: section.isVisible === false ? '#fef3c7' : '#f8fafc',
                          borderBottom: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h3 style={{
                              margin: '0 0 4px 0',
                              color: '#003C69',
                              fontSize: '1.1rem'
                            }}>
                              {section.title || `Content ${index + 1}`}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                background: section.type === 'text' ? '#dbeafe' : 
                                           section.type === 'image' ? '#dcfce7' : '#fef3c7',
                                color: section.type === 'text' ? '#1e40af' : 
                                       section.type === 'image' ? '#166534' : '#92400e',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {section.type === 'text' ? 'Text' : 
                                 section.type === 'image' ? 'Image' : 'Key-Value'}
                              </span>
                              <span style={{
                                color: '#6b7280',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {section.isVisible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                                {section.isVisible === false ? 'Hidden' : 'Visible'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => moveSection(section._id, 'up')}
                              disabled={index === 0}
                              style={{
                                padding: '8px',
                                background: index === 0 ? '#f3f4f6' : '#e5e7eb',
                                color: index === 0 ? '#9ca3af' : '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer'
                              }}
                              title="Move up"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => moveSection(section._id, 'down')}
                              disabled={index === sections.length - 1}
                              style={{
                                padding: '8px',
                                background: index === sections.length - 1 ? '#f3f4f6' : '#e5e7eb',
                                color: index === sections.length - 1 ? '#9ca3af' : '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer'
                              }}
                              title="Move down"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              onClick={() => setEditingSection(section._id)}
                              style={{
                                padding: '8px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section._id)}
                              style={{
                                padding: '8px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div style={{ padding: '16px' }}>
                          {section.type === 'text' && (
                            <div style={{
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#374151',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '200px',
                              overflow: 'auto'
                            }}>
                              {section.content || '(No content)'}
                            </div>
                          )}
                          {section.type === 'image' && (
                            <div>
                              <div style={{
                                background: '#f8fafc',
                                padding: '12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: '#374151',
                                fontFamily: 'monospace',
                                marginBottom: '12px'
                              }}>
                                {section.content}
                              </div>
                              {section.content && (
                                <img
                                  src={section.content}
                                  alt="Preview"
                                  style={{
                                    maxWidth: '200px',
                                    maxHeight: '150px',
                                    borderRadius: '4px',
                                    border: '1px solid #e5e7eb'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          )}
                          {section.type === 'key-value' && (
                            <div style={{
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#374151',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '200px',
                              overflow: 'auto'
                            }}>
                              {section.content || '(No content)'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            color: '#003C69',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Upload size={20} />
            Banner Management
          </h2>
          {banners.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <p>No banner content yet.</p>
              <p style={{ fontSize: '14px' }}>
                Please add banner content through the backend API, or check if API connection is working properly.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {banners.map((banner, index) => (
                <div key={banner._id || index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img
                    src={banner.imageUrl?.startsWith('http') 
                      ? banner.imageUrl 
                      : `${baseApi.replace('/api', '')}${banner.imageUrl}`
                    }
                    alt={banner.title || 'Banner image'}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIEZhaWxlZDwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#003C69',
                      fontSize: '1.1rem'
                    }}>
                      {banner.title || `Banner ${index + 1}`}
                    </h3>
                    {banner.link && (
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        Link: <a href={banner.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                          {banner.link}
                        </a>
                      </p>
                    )}
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      Image path: {banner.imageUrl}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: '#f9fafb',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>API Endpoint:</strong> {baseApi}
        </p>
        <p style={{ margin: '0' }}>
          If you encounter issues, please check network connection and backend API status
        </p>
      </div>
    </div>
  );
};

export default CMS;