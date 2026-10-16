import React, { useState } from 'react';
import API from '../api';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try {
      const res = await API.post('/api/newsletter', {
        email: email.trim(),
        source: 'Blog'
      });
      setStatus({ type: 'success', msg: res.data.message });
      setEmail('');
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Subscription failed. Try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-form">
      <style>{`
        .newsletter-form {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 36px 32px;
          border-radius: 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
        }

        .newsletter-form::before {
          content: "";
          position: absolute;
          top: -60px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 138, 0, 0.22), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .newsletter-form::after {
          content: "";
          position: absolute;
          bottom: -80px;
          left: -60px;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.25), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .newsletter-inner {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .newsletter-icon {
          font-size: 2.4rem;
          margin-bottom: 12px;
          display: inline-block;
          animation: floatIcon 3s ease-in-out infinite;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .newsletter-form h3 {
          margin: 0 0 8px;
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .newsletter-form p {
          color: #cbd5e1;
          margin: 0 0 22px;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .newsletter-input-wrap {
          display: flex;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(148, 163, 184, 0.25);
          border-radius: 12px;
          overflow: hidden;
          max-width: 480px;
          margin: 0 auto;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.25s ease;
        }

        .newsletter-input-wrap:focus-within {
          border-color: #ff8a00;
          box-shadow: 0 0 0 4px rgba(255, 138, 0, 0.15);
        }

        .newsletter-input {
          flex: 1;
          padding: 14px 18px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          min-width: 0;
        }

        .newsletter-input::placeholder {
          color: #94a3b8;
        }

        .newsletter-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .newsletter-btn {
          padding: 0 26px;
          border: none;
          background: linear-gradient(135deg, #ff8a00, #f97316);
          color: #fff;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .newsletter-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #f97316, #ea580c);
          transform: translateX(1px);
        }

        .newsletter-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .newsletter-msg {
          margin-top: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 16px;
          border-radius: 8px;
          display: inline-block;
          animation: msgSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .newsletter-msg.success {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .newsletter-msg.error {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .newsletter-note {
          margin-top: 12px;
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .newsletter-form {
            padding: 28px 20px;
            border-radius: 16px;
          }
          .newsletter-form h3 {
            font-size: 1.2rem;
          }
          .newsletter-form p {
            font-size: 0.85rem;
          }
          .newsletter-input-wrap {
            flex-direction: column;
            border-radius: 12px;
          }
          .newsletter-input {
            padding: 14px 16px;
            text-align: center;
          }
          .newsletter-btn {
            padding: 14px;
            width: 100%;
          }
        }
      `}</style>

      <div className="newsletter-inner">
        <span className="newsletter-icon">📬</span>
        <h3>Stay in the Loop</h3>
        <p>
          Get weekly appliance tips, exclusive offers, and expert advice straight to your inbox.
        </p>

        <form onSubmit={submit}>
          <div className="newsletter-input-wrap">
            <input
              type="email"
              className="newsletter-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              aria-label="Email address"
            />
            <button
              type="submit"
              className="newsletter-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? '⏳ Subscribing...' : '🚀 Subscribe'}
            </button>
          </div>

          {status.msg && (
            <div className={`newsletter-msg ${status.type}`}>{status.msg}</div>
          )}

          <div className="newsletter-note">
            We respect your privacy. Unsubscribe anytime.
          </div>
        </form>
      </div>
    </div>
  );
}