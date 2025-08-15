import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/banners';

const UploadBanner = () => {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [file, setFile] = useState(null);
    const [fetchError, setFetchError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const fetchBanners = () => {
        setLoadingBanners(true);
        setFetchError('');
        fetch(BASE_API)
            .then(res => res.json())
            .then(data => {
                setBanners(data);
                setLoadingBanners(false);
            })
            .catch(err => {
                setFetchError('Failed to load banners');
                setLoadingBanners(false);
            });
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let url = BASE_API;
        let method = 'POST';
        let body = new FormData();

        body.append('title', title);
        body.append('image', image);
        if (file) {
            body.append('file', file);
        }
        if (editingId) {
            url = `${BASE_API}/${editingId}`;
            method = 'PUT';
        }
        
        try {
            const res = await fetch(url, { method, body });
            if (!res.ok) throw new Error('Failed to save banner');
            
            showMessage(editingId ? 'Banner updated successfully!' : 'Banner uploaded successfully!', 'success');
            setTitle('');
            setImage('');
            setFile(null);
            setEditingId(null);
            fetchBanners();
        } catch (err) {
            showMessage('Failed to save banner. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        
        try {
            const res = await fetch(`${BASE_API}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            showMessage('Banner deleted successfully', 'success');
            fetchBanners();
        } catch (err) {
            showMessage('Failed to delete banner', 'error');
        }
    };

    const handleEdit = (banner) => {
        setTitle(banner.title);
        setImage(banner.image || '');
        setFile(null);
        setEditingId(banner._id);
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setTitle('');
        setImage('');
        setFile(null);
        setEditingId(null);
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
                        {editingId ? 'Edit Banner' : 'Upload Banner'}
                    </h1>
                    <p className="page-subtitle">
                        {editingId ? 'Update your existing banner' : 'Create eye-catching banners for your homepage'}
                    </p>
                </div>

                {/* Upload Form */}
                <div className="cms-card">
                    <div className="cms-card-header">
                        <h3 className="cms-card-title">Banner Details</h3>
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
                            <label className="cms-form-label">Banner Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter banner title"
                                className="cms-form-input"
                                required
                            />
                        </div>

                        <div className="cms-form-group">
                            <label className="cms-form-label">Banner Image</label>
                            {!file ? (
                                <div 
                                    className="cms-file-upload"
                                    onClick={() => document.getElementById('banner-file-input').click()}
                                >
                                    <div style={{ fontSize: '2em', marginBottom: '8px' }}></div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Click to upload banner image</div>
                                    <div style={{ fontSize: '0.9em', color: '#64748b' }}>
                                        PNG, JPG, GIF up to 10MB • Recommended: 1920x600px
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
                                id="banner-file-input"
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
                                style={{ flex: 1 }}
                            >
                                {uploading ? 'Uploading...' : (editingId ? 'Update Banner' : 'Upload Banner')}
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

                {/* Banners List */}
                <div className="cms-card">
                    <div className="cms-card-header">
                        <h3 className="cms-card-title">Published Banners ({banners.length})</h3>
                        <button 
                            className="cms-btn cms-btn-secondary cms-btn-small"
                            onClick={fetchBanners}
                            disabled={loadingBanners}
                        >
                            {loadingBanners ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                    
                    {loadingBanners ? (
                        <div className="cms-loading">
                            <div className="cms-spinner"></div>
                            Loading banners...
                        </div>
                    ) : fetchError ? (
                        <div className="cms-message cms-message-error">{fetchError}</div>
                    ) : banners.length === 0 ? (
                        <div className="cms-empty-state">
                            <div style={{ fontSize: '3em', marginBottom: '16px' }}></div>
                            <div>No banners uploaded yet. Create your first banner above!</div>
                        </div>
                    ) : (
                        <ul className="cms-list">
                            {banners.map((banner, idx) => (
                                <li key={banner._id || idx} className="cms-list-item">
                                    <div className="cms-list-item-content">
                                        <div className="cms-list-item-title">{banner.title}</div>
                                        {banner.createdAt && (
                                            <div className="cms-list-item-meta">
                                                {new Date(banner.createdAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {banner.imageUrl && (
                                        <div style={{ marginRight: '16px' }}>
                                            <img
                                                src={banner.imageUrl.startsWith('http') 
                                                    ? banner.imageUrl 
                                                    : `https://entyre-backend.onrender.com${banner.imageUrl}`}
                                                alt=""
                                                style={{ 
                                                    width: '120px', 
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
                                            onClick={() => handleEdit(banner)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="cms-btn cms-btn-danger cms-btn-small"
                                            onClick={() => handleDelete(banner._id)}
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

export default UploadBanner;