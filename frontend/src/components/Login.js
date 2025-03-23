// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post('/api/auth/login', {
        username,
        password
      });
      onLoginSuccess(res.data.user);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="card shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Instructor Login</h2>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
