import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import logo from '../assets/logo.jpeg'; // ✅ NEW: Logo import

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/api/admin/login', creds);

      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <style>{`
        * { box-sizing: border-box; }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* =========================================================
           LOGIN ROOT — PREMIUM GRADIENT BACKGROUND
           ========================================================= */
        .login-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background:
            radial-gradient(circle at 15% 20%, rgba(2, 132, 199, 0.28), transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(34, 197, 94, 0.22), transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12), transparent 60%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a33 100%);
        }

        /* Decorative floating circles */
        .login-root::before,
        .login-root::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .login-root::before {
          top: -180px;
          left: -140px;
          width: 420px;
          height: 420px;
          border: 1px solid rgba(56, 189, 248, 0.15);
          box-shadow:
            0 0 0 60px rgba(56, 189, 248, 0.03),
            0 0 0 120px rgba(56, 189, 248, 0.02);
          animation: floatSlow 12s ease-in-out infinite;
        }

        .login-root::after {
          bottom: -160px;
          right: -120px;
          width: 380px;
          height: 380px;
          border: 1px solid rgba(34, 197, 94, 0.15);
          box-shadow:
            0 0 0 60px rgba(34, 197, 94, 0.03),
            0 0 0 120px rgba(34, 197, 94, 0.02);
          animation: floatSlow 14s ease-in-out infinite reverse;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.03); }
        }

        /* =========================================================
           LOGIN CARD
           ========================================================= */
        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 42px 36px 36px;
          border-radius: 22px;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(226, 232, 240, 0.9);
          animation: cardSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        /* Gradient top accent bar */
        .login-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, #0284c7, #22c55e, #38bdf8, #0284c7);
          background-size: 200% 100%;
          animation: gradientShift 4s linear infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* =========================================================
           BRAND LOGO & HEADER
           ========================================================= */
        .login-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        /* ✅ UPDATED: Wrapper for circular image */
        .login-logo {
          position: relative;
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          animation: logoPulse 3s ease-in-out infinite;
        }

        /* Outer animated ring */
        .login-logo::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid rgba(2, 132, 199, 0.25);
          animation: logoRing 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* ✅ NEW: Circular logo image */
        .login-logo-img {
          width: 76px;
          height: 76px;
          min-width: 76px;
          min-height: 76px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          object-position: center;
          border-radius: 50%;
          display: block;
          background: #ffffff;
          border: 3px solid #ffffff;
          box-shadow:
            0 14px 30px rgba(2, 132, 199, 0.35),
            0 0 0 3px rgba(2, 132, 199, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .login-logo:hover .login-logo-img {
          transform: scale(1.05) rotate(-4deg);
          box-shadow:
            0 18px 40px rgba(2, 132, 199, 0.45),
            0 0 0 4px rgba(2, 132, 199, 0.25);
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        @keyframes logoRing {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.2); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 1.55rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .login-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .login-subtitle strong {
          color: #0284c7;
          font-weight: 700;
        }

        /* =========================================================
           ERROR ALERT
           ========================================================= */
        .login-error {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.88rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: shake 0.4s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
        }

        .login-error-icon {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          background: #ffffff;
          border-radius: 50%;
          flex-shrink: 0;
          font-size: 0.9rem;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }

        /* =========================================================
           FORM
           ========================================================= */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-label-icon {
          font-size: 0.9rem;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          font-weight: 500;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .form-input:hover {
          border-color: #94a3b8;
          background: #ffffff;
        }

        .form-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
        }

        .form-input.has-toggle {
          padding-right: 48px;
        }

        /* Left icon inside input */
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.05rem;
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.25s ease;
        }

        .form-input:focus ~ .input-icon {
          color: #0284c7;
        }

        /* Password toggle button */
        .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          color: #64748b;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .password-toggle:hover {
          background: #e0f2fe;
          color: #0284c7;
        }

        /* =========================================================
           LOGIN BUTTON
           ========================================================= */
        .login-submit {
          margin-top: 8px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.98rem;
          font-family: inherit;
          letter-spacing: 0.3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 12px 26px rgba(2, 132, 199, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-submit::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          transition: left 0.6s ease;
        }

        .login-submit:hover:not(:disabled)::before {
          left: 100%;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 16px 34px rgba(2, 132, 199, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.85;
          background: linear-gradient(135deg, #64748b, #475569);
        }

        /* Loading spinner */
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* =========================================================
           FOOTER SECURITY NOTE
           ========================================================= */
        .login-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px dashed #e2e8f0;
          text-align: center;
        }

        .login-footer-text {
          font-size: 0.76rem;
          color: #94a3b8;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          letter-spacing: 0.2px;
        }

        .login-footer-text span {
          color: #22c55e;
          font-weight: 700;
        }

        /* =========================================================
           RESPONSIVE
           ========================================================= */
        @media (max-width: 480px) {
          .login-root {
            padding: 16px;
          }

          .login-card {
            padding: 32px 22px 26px;
            border-radius: 18px;
          }

          .login-logo {
            width: 62px;
            height: 62px;
          }

          .login-logo-img {
            width: 62px;
            height: 62px;
            min-width: 62px;
            min-height: 62px;
            border-width: 3px;
          }

          .login-title {
            font-size: 1.3rem;
          }

          .login-subtitle {
            font-size: 0.82rem;
          }

          .form-input {
            padding: 12px 14px 12px 42px;
            font-size: 0.92rem;
          }

          .login-submit {
            padding: 13px 18px;
            font-size: 0.92rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo">
            <img
              src={logo}
              alt="Chintu AC Cool Care"
              className="login-logo-img"
            />
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h2 className="login-title">Admin Access Portal</h2>
          <p className="login-subtitle">
            Chintu Cool <strong>Control Panel</strong>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error">
            <span className="login-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              <span className="form-label-icon">👤</span>
              Username
            </label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. admin"
                required
                autoComplete="username"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="form-label-icon">🔒</span>
              Password
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Authenticating...
              </>
            ) : (
              <>
                🚀 Login to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-footer-text">
            <span>🔒</span>
            Secure Connection <span>•</span> 256-bit SSL Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}