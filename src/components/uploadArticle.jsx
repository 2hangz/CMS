import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';

const UploadArticle = () => {
  const API_BASE = 'https://entyre-backend.onrender.com/api/articles';
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchArticles = () => {
    setLoadingArticles(true);
    setFetchError('');
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoadingArticles(false);
      })
      .catch(err => {
        setFetchError('Failed to load articles');
        setLoadingArticles(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let url = API_BASE;
    let method = 'POST';
    let body = new FormData();

    body.append('title', title);
    body.append('summary', summary);
    body.append('content', content);
    if (file) {
      body.append('file', file);
    }

    if (editingId) {
      url = `${API_BASE}/${editingId}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, { method, body });
      if (!res.ok) throw new Error('Failed to save article');
      
      showMessage(editingId ? 'Article updated successfully!' : 'Article uploaded successfully!', 'success');
      setTitle('');
      setSummary('');
      setContent('');
      setFile(null);
      setEditingId(null);
      fetchArticles();
    } catch (err) {
      showMessage('Failed to save article. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showMessage('Article deleted successfully', 'success');
      fetchArticles();
    } catch (err) {
      showMessage('Failed to delete article', 'error');
    }
  };

  const handleEdit = (article) => {
    setTitle(article.title);
    setSummary(article.summary || '');
    setContent(article.content || '');
    setEditingId(article._id);
    setFile(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setEditingId(null);
    setFile(null);
    setMessage('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="cms-layout">
      <Navbar />
      <div className="cms-main-content">
        <div className="page-header">
          <h1 className="page-title">
            {editingId ? 'Edit Article' : 'Upload Article'}
          </h1>
          <p className="page-subtitle">
            {editingId ? 'Update your existing article' : 'Create and publish new articles with rich content'}
          </p>
        </div>

        {/* Upload Form */}
        <div className="cms-card">
          <div className="cms-card-header">
            <h3 className="cms-card-title">Article Details</h3>
            {editingId && (
              <span style={{ 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '0.8em',
                fontWeight: '500'
              }}>
                Editing Mode
              </span>
            )}
          </div>

          {message && (
            <div className={`cms-message cms-message-${messageType}`}>
              {messageType === 'success' && ''}
              {messageType === 'error' && ''}
              {messageType === 'info' && ''}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="cms-form-group">
              <label className="cms-form-label">Article Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter a compelling article title"
                className="cms-form-input"
                required
              />
            </div>

            <div className="cms-form-group">
              <label className="cms-form-label">Summary *</label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Brief summary that will appear in previews"
                className="cms-form-input"
                required
              />
            </div>

            <div className="cms-form-group">
              <label className="cms-form-label">Content *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your article content here. You can use markdown formatting..."
                rows={8}
                className="cms-form-textarea"
                required
              />
              <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '4px' }}>
                Tip: You can use markdown formatting for better content structure
              </div>
            </div>

            <div className="cms-form-group">
              <label className="cms-form-label">Featured Image (optional)</label>
              {!file ? (
                <div 
                  className="cms-file-upload"
                  onClick={() => document.getElementById('article-file-input').click()}
                >
                  <div style={{ fontSize: '2em', marginBottom: '8px' }}></div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Click to upload image</div>
                  <div style={{ fontSize: '0.9em', color: '#64748b' }}>
                    PNG, JPG, GIF up to 10MB
                  </div>
                </div>
              ) : (
                <div className="cms-file-upload has-file">
                  <div style={{ fontSize: '1.5em', marginBottom: '8px' }}></div>
                  <div className="cms-file-info">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="cms-file-remove"
                      onClick={removeFile}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <input
                id="article-file-input"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                type="submit" 
                className="cms-btn cms-btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Saving...' : (editingId ? 'Update Article' : 'Publish Article')}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  className="cms-btn cms-btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Articles List */}
        <div className="cms-card">
          <div className="cms-card-header">
            <h3 className="cms-card-title">Published Articles ({articles.length})</h3>
            <button 
              className="cms-btn cms-btn-secondary cms-btn-small"
              onClick={fetchArticles}
              disabled={loadingArticles}
            >
              {loadingArticles ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingArticles ? (
            <div className="cms-loading">
              <div className="cms-spinner"></div>
              Loading articles...
            </div>
          ) : fetchError ? (
            <div className="cms-message cms-message-error">{fetchError}</div>
          ) : articles.length === 0 ? (
            <div className="cms-empty-state">
              <div style={{ fontSize: '3em', marginBottom: '16px' }}></div>
              <div>No articles published yet. Create your first article above!</div>
            </div>
          ) : (
            <ul className="cms-list">
              {articles.map((article, idx) => (
                <li key={article._id || idx} className="cms-list-item">
                  <div className="cms-list-item-content">
                    <div className="cms-list-item-title">{article.title}</div>
                    {article.summary && (
                      <div className="cms-list-item-meta" style={{ marginBottom: '4px' }}>
                        {article.summary}
                      </div>
                    )}
                    {article.content && (
                      <div className="cms-list-item-meta" style={{ fontStyle: 'italic' }}>
                        {article.content.substring(0, 80)}
                        {article.content.length > 80 ? '...' : ''}
                      </div>
                    )}
                    {article.createdAt && (
                      <div className="cms-list-item-meta" style={{ marginTop: '8px', fontSize: '0.8em' }}>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {article.imageUrl && (
                    <div style={{ marginRight: '16px' }}>
                      <img
                        src={article.imageUrl.startsWith('http') 
                          ? article.imageUrl 
                          : `https://entyre-backend.onrender.com${article.imageUrl}`}
                        alt=""
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </div>
                  )}

                  <div className="cms-list-item-actions">
                    <button
                      className="cms-btn cms-btn-warning cms-btn-small"
                      onClick={() => handleEdit(article)}
                    >
                      Edit
                    </button>
                    <button
                      className="cms-btn cms-btn-danger cms-btn-small"
                      onClick={() => handleDelete(article._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadArticle;