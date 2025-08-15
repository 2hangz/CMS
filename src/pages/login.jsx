import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Please enter your username');
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Demo: hardcoded login
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('token', 'demo-token');
      navigate('/home');
    } else {
      setError('Invalid username or password. Try admin/1234');
    }
    setLoading(false);
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('1234');
    setError('');
  };

  return (
    <div className="login-page-bg">
      <div className="login-form-container">
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3em', 
            marginBottom: '8px',
            background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {/* Removed emoji */}
          </div>
          <h2 className="login-form-title">ENTYRE CMS</h2>
          <p style={{ 
            margin: 0, 
            color: '#64748b', 
            fontSize: '0.95em',
            fontWeight: '500'
          }}>
            Content Management System
          </p>
        </div>

        {error && (
          <div className="login-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-form-label">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="login-form-input"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="login-form-group">
            <label className="login-form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-form-input"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-form-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button 
            type="button"
            onClick={fillDemoCredentials}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              color: '#64748b',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = 'transparent';
            }}
          >
            Use Demo Credentials
          </button>
        </form>

        {/* Footer */}
        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center', 
          fontSize: '0.85em', 
          color: '#94a3b8' 
        }}>
          <div>Demo: admin / 1234</div>
          <div style={{ marginTop: '4px' }}>
            Powered by ENTYRE CMS v2.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;