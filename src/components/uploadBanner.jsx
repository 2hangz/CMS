import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';

const BASE_API = 'https://entyre-backend.onrender.com/api/banners';

const UploadBanner = () => {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [file, setFile] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [message, setMessage] = useState('');
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchBanners = () => {
        setLoadingBanners(true);
        fetch(BASE_API)
            .then(res => res.json())
            .then(data => {
                setBanners(data);
                setLoadingBanners(false);
            });
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let url = BASE_API;
        let method = 'POST';
        let body;

        body = new FormData();
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
            const res = await fetch(url, {
                method,
                body,
            });
            if (!res.ok) throw new Error('Failed to save banner');
            setMessage(editingId ? 'Banner updated!' : 'Banner uploaded!');
            setTitle('');
            setImage('');
            setFile(null);
            setEditingId(null);
            fetchBanners();
        } catch {
            setMessage('Failed to upload banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`${BASE_API}/${id}`, { method: 'Delete' });
            if (!res.ok) throw new Error('Failed to delete');
            setMessage('Banner deleted');
            fetchBanners();
        } catch {
            setMessage('Failed to delete banner');
        }
    };

    const handleEdit = (banner) => {
        setTitle(banner.title);
        setImage(banner.image);
        setFile(null);
        setEditingId(banner._id);
        setMessage('');
    };

    const handleCancelEdit = () => {
        setTitle('');
        setImage('');
        setFile(null);
        setEditingId(null);
        setMessage('');
    };

    // Inline styles to replace dashboard-related CSS
    const containerStyle = {
        maxWidth: 600,
        margin: '2rem auto',
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    };
    const titleStyle = { marginBottom: 16 };
    const statusStyle = { marginBottom: 16, color: '#555' };
    const messageStyle = { marginBottom: 16, color: '#2a7ae4' };
    const formGroupStyle = { marginBottom: 16 };
    const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500 };
    const inputStyle = { width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' };
    const buttonStyle = {
        background: '#2a7ae4',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1.2rem',
        borderRadius: 4,
        cursor: 'pointer',
        marginTop: 8
    };
    const cancelBtnStyle = {
        ...buttonStyle,
        marginLeft: 24,
        background: '#888'
    };
    const selectedFileInfoStyle = { fontSize: 12, color: '#555', marginTop: 4 };
    const removeFileBtnStyle = {
        marginLeft: 8,
        fontSize: 12,
        background: 'none',
        border: 'none',
        color: '#e74c3c',
        cursor: 'pointer'
    };
    const existingContainerStyle = { marginTop: 32, width: '100%', maxWidth: 600 };
    const fetchErrorStyle = { color: 'red' };
    const listItemStyle = { display: 'flex', alignItems: 'center', marginBottom: 8 };
    const listMainStyle = { flex: 1 };
    const imageWrapperStyle = { marginLeft: 8 };
    const imageStyle = { maxWidth: 60, maxHeight: 40, verticalAlign: 'middle', marginLeft: 4 };
    const editBtnStyle = {
        marginLeft: 8,
        fontSize: 12,
        background: '#f1c40f',
        color: '#222',
        border: 'none',
        borderRadius: 3,
        padding: '2px 8px',
        cursor: 'pointer'
    };
    const deleteBtnStyle = {
        marginLeft: 8,
        fontSize: 12,
        color: '#fff',
        background: '#e74c3c',
        border: 'none',
        borderRadius: 3,
        padding: '2px 8px',
        cursor: 'pointer'
    };

    return (
        <div>
            <Navbar />
            <div style={containerStyle}>
                <h2 style={titleStyle}>{editingId ? 'Edit Banner' : 'Upload Banner'}</h2>
                <div style={statusStyle}>
                    {editingId ? 'Editing existing banner' : 'Upload your banner below'}
                </div>
                {message && <div style={messageStyle}>{message}</div>}
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter banner title"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Upload file (optional)</label>
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files[0])}
                        />
                        {file && (
                            <div style={selectedFileInfoStyle}>
                                Selected: {file.name}
                                <button
                                    type="button"
                                    style={removeFileBtnStyle}
                                    onClick={() => setFile(null)}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="submit" style={buttonStyle}>
                        {editingId ? 'Update Banner' : 'Upload Banner'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            style={cancelBtnStyle}
                            onClick={handleCancelEdit}
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>
                <div style={existingContainerStyle}>
                    <h3>Existing Banners</h3>
                    {loadingBanners && <div>Loading banners...</div>}
                    {fetchError && <div style={fetchErrorStyle}>{fetchError}</div>}
                    {!loadingBanners && !fetchError && (
                        <ul style={{ padding: 0, listStyle: 'none' }}>
                            {banners.length === 0 && <li>No banners found.</li>}
                            {banners.map((banner, idx) => (
                                <li key={banner._id || idx} style={listItemStyle}>
                                    <div style={listMainStyle}>
                                        <strong>{banner.title}</strong>
                                        {banner.imageUrl && (
                                            <span style={imageWrapperStyle}>
                                                <img
                                                    src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `https://entyre-backend.onrender.com${banner.imageUrl}`}
                                                    alt=""
                                                    style={imageStyle}
                                                />
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        style={editBtnStyle}
                                        onClick={() => handleEdit(banner)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={deleteBtnStyle}
                                        onClick={() => handleDelete(banner._id)}
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

export default UploadBanner;
