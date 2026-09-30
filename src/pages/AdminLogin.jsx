import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', creds);
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', background: 'white', padding: '30px', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Access Portal</h2>
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Fixed Username (admin)" 
          required 
          value={creds.username} 
          onChange={(e) => setCreds({ ...creds, username: e.target.value })} 
        />
        <input 
          type="password" 
          placeholder="Fixed Password (Admin@12345)" 
          required 
          value={creds.password} 
          onChange={(e) => setCreds({ ...creds, password: e.target.value })} 
        />
        <button type="submit">Login to Dashboard</button>
      </form>
    </div>
  );
}