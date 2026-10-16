// src/components/NewsLetterForm.jsx
import React, { useState } from 'react';
import API from '../api';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await API.post('/api/newsletter', { email });
      if (res.data?.success) {
        setStatus('Subscribed successfully!');
        setEmail('');
      } else {
        setStatus(res.data?.message || 'Subscribed!');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      padding: '30px',
      borderRadius: '16px',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
        Subscribe to Appliance Tips
      </h3>
      <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '0.9rem' }}>
        Stay updated with expert AC maintenance guides and servicing tips.
      </p>
      {status && (
        <p style={{ color: '#0284c7', fontWeight: 700, marginBottom: '12px' }}>{status}</p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            outline: 'none',
            minWidth: '240px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#0284c7',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
