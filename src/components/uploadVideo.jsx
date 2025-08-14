import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/videos';

const UploadVideo = () => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [localVideoFile, setLocalVideoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [fetchError, setFetchError] = useState('');

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
        setFetchError('Failed to fetch videos');
        setLoadingVideos(false);
      });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const res = await fetch(url, {
        method,
        body,
      });
      if (!res.ok) throw new Error('Failed to save video');
      setMessage(editingId ? 'Video updated!' : 'Video uploaded!');
      setTitle('');
      setVideoUrl('');
      setThumbnailFile(null);
      setLocalVideoFile(null);
      setEditingId(null);
      fetchVideos();
    } catch {
      setMessage('Failed to upload/update video');
    }
  };

  const handleEdit = (video) => {
    setTitle(video.title);
    setVideoUrl(video.videoUrl || '');
    setEditingId(video._id);
    setThumbnailFile(null);
    setLocalVideoFile(null);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`${BASE_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMessage('Video deleted');
      fetchVideos();
    } catch (err) {
      setMessage('Failed to delete video');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: 16 }}>Upload Video</h2>
        <div style={{ marginBottom: 16, color: '#555' }}>Upload your video below</div>
        {message && <div style={{ marginBottom: 16, color: '#2a7ae4' }}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter video title"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Video Url (for online video, optional if uploading local file)</label>
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="Enter video url"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              disabled={!!localVideoFile}
              required={!localVideoFile}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Upload Local Video (mp4, mov, etc)</label>
            <input
              type="file"
              accept="video/*"
              onChange={e => {
                setLocalVideoFile(e.target.files[0]);
                setVideoUrl('');
              }}
            />
            {localVideoFile && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Selected: {localVideoFile.name}
                <button
                  type="button"
                  style={{ marginLeft: 8, fontSize: 12, background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                  onClick={() => setLocalVideoFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Upload Video Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setThumbnailFile(e.target.files[0])}
            />
            {thumbnailFile && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Selected: {thumbnailFile.name}
                <button
                  type="button"
                  style={{ marginLeft: 8, fontSize: 12, background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                  onClick={() => setThumbnailFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{
              background: '#2a7ae4',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1.2rem',
              borderRadius: 4,
              cursor: 'pointer',
              marginTop: 8,
              fontWeight: 500,
              width: '100%'
            }}
          >
            {editingId ? 'Update Video' : 'Upload Video'}
          </button>
          {editingId && (
            <button
              type="button"
              style={{
                marginTop: 8,
                marginLeft: 0,
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: 4,
                padding: '0.5rem 1.2rem',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setVideoUrl('');
                setThumbnailFile(null);
                setLocalVideoFile(null);
                setMessage('');
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Existing Videos</h3>
          {loadingVideos && <div>Loading videos...</div>}
          {fetchError && <div style={{ color: 'red' }}>{fetchError}</div>}
          {!loadingVideos && !fetchError && (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {videos.length === 0 && <li>No videos found.</li>}
              {videos.map((video, idx) => (
                <li key={video._id || idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{video.title}</strong>
                    {video.thumbnail && (
                      <span style={{ marginLeft: 8 }}>
                        <img
                          src={
                            video.thumbnail.startsWith('http')
                              ? video.thumbnail
                              : `https://entyre-backend.onrender.com${video.thumbnail}`
                          }
                          alt=""
                          style={{ maxWidth: 60, maxHeight: 40, verticalAlign: 'middle', marginLeft: 4 }}
                        />
                      </span>
                    )}
                    {video.videoUrl && (
                      <span style={{ marginLeft: 12, fontSize: 13, color: '#888' }}>
                        {video.videoUrl.startsWith('/uploads/')
                          ? <span>[local Video]</span>
                          : <span>[Cloud Video]</span>
                        }
                        <a
                          href={
                            video.videoUrl.startsWith('http')
                              ? video.videoUrl
                              : `https://entyre-backend.onrender.com${video.videoUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: 6, color: '#2a7ae4', textDecoration: 'underline' }}
                        >
                          预览
                        </a>
                      </span>
                    )}
                  </div>
                  <button
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      background: '#f1c40f',
                      color: '#222',
                      border: 'none',
                      borderRadius: 3,
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEdit(video)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: '#fff',
                      background: '#e74c3c',
                      border: 'none',
                      borderRadius: 3,
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDelete(video._id)}
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

export default UploadVideo;