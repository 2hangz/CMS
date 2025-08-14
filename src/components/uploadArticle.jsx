import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';

const UploadArticle = () => {
  const API_BASE = 'https://entyre-backend.onrender.com/api/articles';
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchArticles = () => {
    setLoadingArticles(true);
    setFetchError('');
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoadingArticles(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    let url = API_BASE;
    let method = 'POST';
    let body;

    body = new FormData();
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
      const res = await fetch(url, {
        method,
        body,
      });
      if (!res.ok) throw new Error('Failed to save article');
      setMessage(editingId ? 'Article updated!' : 'Article uploaded!');
      setTitle('');
      setSummary('');
      setContent('');
      setFile(null);
      setEditingId(null);
      fetchArticles();
    } catch {
      setMessage('Failed to upload/update article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMessage('Article deleted');
      fetchArticles();
    } catch {
      setMessage('Failed to delete article');
    }
  };

  const handleEdit = (article) => {
    setTitle(article.title);
    setSummary(article.summary || '');
    setContent(article.content || '');
    setEditingId(article._id);
    setFile(null);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setEditingId(null);
    setFile(null);
    setMessage('');
  };

  return (
    <div>
      <Navbar />
      <div className="upload-article-container">
        <h2 className="upload-article-title">{editingId ? 'Edit Article' : 'Upload Article'}</h2>
        <div className="upload-article-status">
          {editingId ? 'Editing existing article' : 'Upload your article below'}
        </div>
        {message && <div className="upload-article-message">{message}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="upload-article-form-group">
            <label className="upload-article-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter article title"
              className="upload-article-input"
              required
            />
          </div>
          <div className="upload-article-form-group">
            <label className="upload-article-label">Summary</label>
            <input
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Enter article summary"
              className="upload-article-input"
              required
            />
          </div>
          <div className="upload-article-form-group">
            <label className="upload-article-label">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter article content"
              rows={6}
              className="upload-article-textarea"
              required
            />
          </div>
          <div className="upload-article-form-group">
            <label className="upload-article-label">Upload file (optional)</label>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
            />
            {file && (
              <div className="upload-article-selected-file">
                Selected: {file.name}
                <button
                  type="button"
                  className="upload-article-remove-file-btn"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <button type="submit" className="upload-btn">
            {editingId ? 'Update Article' : 'Upload Article'}
          </button>
          {editingId && (
            <button
              type="button"
              className="upload-article-btn upload-article-btn-cancel"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div className="upload-article-existing-container">
          <h3>Existing Articles</h3>
          {loadingArticles && <div>Loading articles...</div>}
          {fetchError && <div className="upload-article-fetch-error">{fetchError}</div>}
          {!loadingArticles && !fetchError && (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {articles.length === 0 && <li>No articles found.</li>}
              {articles.map((article, idx) => (
                <li key={article._id || idx} className="upload-article-list-item">
                  <div className="upload-article-list-main">
                    <strong>{article.title}</strong>
                    {article.summary && (
                      <span style={{ marginLeft: 8, color: '#555' }}>
                        ({article.summary})
                      </span>
                    )}
                    {article.content && (
                      <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
                        - {article.content.substring(0, 40)}{article.content.length > 40 ? '...' : ''}
                      </span>
                    )}
                    {article.imageUrl && (
                      <span className="upload-article-image-wrapper">
                        <img
                          src={article.imageUrl.startsWith('http') ? article.imageUrl : `https://entyre-backend.onrender.com${article.imageUrl}`}
                          alt=""
                          className="upload-article-image"
                        />
                      </span>
                    )}
                  </div>
                  <button
                    className="upload-article-edit-btn"
                    onClick={() => handleEdit(article)}
                  >
                    Edit
                  </button>
                  <button
                    className="upload-article-delete-btn"
                    onClick={() => handleDelete(article._id)}
                  >
                    Delete
                  </button>
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