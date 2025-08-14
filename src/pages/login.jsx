import React, { useState } from 'react';
import Home from './home';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter username');
      return;
    }
    if (!password) {
      setError('Please enter password');
      return;
    }
    setError('');
    // Demo: hardcoded login
    if (username === 'admin' && password === '1234') {
      setLoggedIn(true);
      return;
    }
    setError('Invalid username or password');
  };

  if (loggedIn) {
    return <Home />;
  }

  return (
    <div className="login-page-bg">
      <form
        onSubmit={handleSubmit}
        className="login-form-container"
      >
        <h2 className="login-form-title">Login</h2>
        {error && (
          <div className="login-form-error">{error}</div>
        )}
        <div className="login-form-group">
          <label className="login-form-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="login-form-input"
            placeholder="Enter username"
          />
        </div>
        <div className="login-form-group">
          <label className="login-form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-form-input"
            placeholder="Enter password"
          />
        </div>
        <button
          type="submit"
          className="login-form-button"
        >
          Login
        </button>
        <button onClick={() => {
            setUsername("admin");
            setPassword("1234");
        }}>Fill Dev Credentials</button>
      </form>
    </div>
  );
};

export default Login;