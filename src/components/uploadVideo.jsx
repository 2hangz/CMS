import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/videos';

const UploadVideo = () => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [localVideoFile, setLocalVideoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchVideos = () => {
    setLoadingVideos(true);
    setFetchError('');
    fetch(BASE_API)
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoadingVideos(false);
      })
      .catch(err => {
        setFetchError('Failed to load videos');
        setLoadingVideos(false);
      });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let url = BASE_API;
    let method = 'POST';
    let body = new FormData();

    body.append('title', title);

    if (localVideoFile) {
      body.append('localVideo', localVideoFile);
    } else {
      body.append('videoUrl', videoUrl);
    }

    if (thumbnailFile) {
      body.append('file', thumbnailFile);
    }

    if (editingId) {
      url = `${BASE_API}/${editingId}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, { method, body });
      if (!res.ok) throw new Error('Failed to save video');
      
      showMessage(editingId ? 'Video updated successfully!' : 'Video uploaded successfully!', 'success');
      setTitle('');
      setVideoUrl('');
      setThumbnailFile(null);
      setLocalVideoFile(null);
      setEditingId(null);
      fetchVideos();
    } catch (err) {
      showMessage('Failed to save video. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (video) => {
    setTitle(video.title);
    setVideoUrl(video.videoUrl || '');
    setEditingId(video._id);
    setThumbnailFile(null);
    setLocalVideoFile(null);
    setUploadMode(video.videoUrl && !video.videoUrl.includes('cloudinary') ? 'url' : 'file');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const res = await fetch(`${BASE_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showMessage('Video deleted successfully', 'success');
      fetchVideos();
    } catch (err) {
      showMessage('Failed to delete video', 'error');
    }
  };

  const handleCancelEdit = () => {
    setTitle('');
    setVideoUrl('');
    setThumbnailFile(null);
    setLocalVideoFile(null);
    setEditingId(null);
    setUploadMode('url');
    setMessage('');
  };

  const handleModeChange = (mode) => {
    setUploadMode(mode);
    setVideoUrl('');
    setLocalVideoFile(null);
  };

  return (
    <div className="cms-layout">
      <Navbar />
      <div className="cms-main-content">
        <div className="page-header">
          <h1 className="page-title">
            {editingId ? 'Edit Video' : 'Upload Video'}
          </h1>
          <p className="page-subtitle">
            {editingId ? 'Update your existing video' : 'Upload videos from URL or local files with custom thumbnails'}
          </p>
        </div>

        {/* Upload Form */}
        <div className="cms-card">
          <div className="cms-card-header">
            <h3 className="cms-card-title">Video Details</h3>
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

          <form onSubmit={handleSubmit}>
            <div className="cms-form-group">
              <label className="cms-form-label">Video Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="cms-form-input"
                required
              />
            </div>

            {/* Video Source Mode Toggle */}
            <div className="cms-form-group">
              <label className="cms-form-label">Video Source</label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    checked={uploadMode === 'url'}
                    onChange={() => handleModeChange('url')}
                  />
                  Video URL
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    checked={uploadMode === 'file'}
                    onChange={() => handleModeChange('file')}
                  />
                  Upload File
                </label>
              </div>

              {uploadMode === 'url' ? (
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="cms-form-input"
                  required={!localVideoFile}
                />
              ) : (
                <div>
                  {!localVideoFile ? (
                    <div 
                      className="cms-file-upload"
                      onClick={() => document.getElementById('video-file-input').click()}
                    >
                      <div style={{ fontSize: '2em', marginBottom: '8px' }}></div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Click to upload video</div>
                      <div style={{ fontSize: '0.9em', color: '#64748b' }}>
                        MP4, MOV, AVI up to 100MB
                      </div>
                    </div>
                  ) : (
                    <div className="cms-file-upload has-file">
                      <div style={{ fontSize: '1.5em', marginBottom: '8px' }}></div>
                      <div className="cms-file-info">
                        <span>{localVideoFile.name}</span>
                        <button
                          type="button"
                          className="cms-file-remove"
                          onClick={() => setLocalVideoFile(null)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/*"
                    onChange={e => setLocalVideoFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="cms-form-group">
              <label className="cms-form-label">Video Thumbnail (optional)</label>
              {!thumbnailFile ? (
                <div 
                  className="cms-file-upload"
                  onClick={() => document.getElementById('thumbnail-file-input').click()}
                >
                  <div style={{ fontSize: '1.5em', marginBottom: '8px' }}></div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Click to upload thumbnail</div>
                  <div style={{ fontSize: '0.9em', color: '#64748b' }}>
                    PNG, JPG up to 5MB
                  </div>
                </div>
              ) : (
                <div className="cms-file-upload has-file">
                  <div style={{ fontSize: '1.5em', marginBottom: '8px' }}></div>
                  <div className="cms-file-info">
                    <span>{thumbnailFile.name}</span>
                    <button
                      type="button"
                      className="cms-file-remove"
                      onClick={() => setThumbnailFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <input
                id="thumbnail-file-input"
                type="file"
                accept="image/*"
                onChange={e => setThumbnailFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                className="cms-btn cms-btn-primary"
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? 'Uploading...' : (editingId ? 'Update Video' : 'Upload Video')}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cms-btn cms-btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Videos List */}
        <div className="cms-card">
          <div className="cms-card-header">
            <h3 className="cms-card-title">Video Library ({videos.length})</h3>
            <button 
              className="cms-btn cms-btn-secondary cms-btn-small"
              onClick={fetchVideos}
              disabled={loadingVideos}
            >
              {loadingVideos ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingVideos ? (
            <div className="cms-loading">
              <div className="cms-spinner"></div>
              Loading videos...
            </div>
          ) : fetchError ? (
            <div className="cms-message cms-message-error">{fetchError}</div>
          ) : videos.length === 0 ? (
            <div className="cms-empty-state">
              <div style={{ fontSize: '3em', marginBottom: '16px' }}></div>
              <div>No videos uploaded yet. Add your first video above!</div>
            </div>
          ) : (
            <ul className="cms-list">
              {videos.map((video, idx) => (
                <li key={video._id || idx} className="cms-list-item">
                  <div className="cms-list-item-content">
                    <div className="cms-list-item-title">{video.title}</div>
                    <div className="cms-list-item-meta">
                      {video.videoUrl && (
                        <div style={{ marginBottom: '4px' }}>
                          {video.videoUrl.includes('cloudinary') ? (
                            <span style={{ color: '#10b981' }}>Cloud Video</span>
                          ) : video.videoUrl.startsWith('/uploads/') ? (
                            <span style={{ color: '#3b82f6' }}>Local Video</span>
                          ) : (
                            <span style={{ color: '#f59e0b' }}>External Video</span>
                          )}
                          <a
                            href={
                              video.videoUrl.startsWith('http')
                                ? video.videoUrl
                                : `https://entyre-backend.onrender.com${video.videoUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              marginLeft: '8px', 
                              color: '#3b82f6', 
                              textDecoration: 'none',
                              fontSize: '0.9em'
                            }}
                          >
                            Preview
                          </a>
                        </div>
                      )}
                      {video.createdAt && (
                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {video.thumbnail && (
                    <div style={{ marginRight: '16px' }}>
                      <img
                        src={
                          video.thumbnail.startsWith('http')
                            ? video.thumbnail
                            : `https://entyre-backend.onrender.com${video.thumbnail}`
                        }
                        alt=""
                        style={{ 
                          width: '80px', 
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
                      onClick={() => handleEdit(video)}
                    >
                      Edit
                    </button>
                    <button
                      className="cms-btn cms-btn-danger cms-btn-small"
                      onClick={() => handleDelete(video._id)}
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

export default UploadVideo;