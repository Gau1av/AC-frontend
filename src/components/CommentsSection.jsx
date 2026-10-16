import React, { useState } from 'react';
import API from '../api';

export default function CommentsSection({ blogId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setSubmitting(true);
    try {
      const res = await API.post('/api/comments', { blogId, ...form });
      setStatus({ type: 'success', msg: res.data.message });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to submit comment'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (n) =>
    (n || '?')
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className="comments-section">
      <style>{`
        .comments-section {
          max-width: 860px;
          margin: 60px auto 0;
          padding: 0 20px;
        }
        .comments-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .comments-header h2 {
          font-size: 1.5rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .comments-count {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: #0369a1;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .comment-form {
          background: #ffffff;
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }
        .comment-form h3 {
          margin: 0 0 18px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .comment-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .comment-field { display: flex; flex-direction: column; }
        .comment-field label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 5px;
        }
        .comment-field input,
        .comment-field textarea {
          padding: 11px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #0f172a;
        }
        .comment-field input:focus,
        .comment-field textarea:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
        }
        .comment-field textarea {
          resize: vertical;
          min-height: 100px;
          line-height: 1.5;
        }
        .comment-submit-btn {
          margin-top: 8px;
          padding: 12px 28px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.25);
          transition: all 0.25s ease;
        }
        .comment-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(2, 132, 199, 0.35);
        }
        .comment-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .comment-status {
          margin-top: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .comment-status.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .comment-status.error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .comment-item {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          border: 1px solid #e2e8f0;
          display: flex;
          gap: 16px;
          transition: all 0.2s ease;
        }
        .comment-item:hover {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }
        .comment-avatar {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 0.9rem;
          box-shadow: 0 6px 14px rgba(2, 132, 199, 0.25);
        }
        .comment-body { flex: 1; min-width: 0; }
        .comment-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .comment-name {
          font-weight: 800;
          color: #0f172a;
          font-size: 0.95rem;
        }
        .comment-date {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .comment-text {
          color: #475569;
          line-height: 1.65;
          font-size: 0.93rem;
          margin: 0;
          word-wrap: break-word;
        }
        .no-comments {
          text-align: center;
          padding: 32px 20px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }
        .no-comments span {
          display: block;
          font-size: 2rem;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        @media (max-width: 640px) {
          .comment-form-row { grid-template-columns: 1fr; }
          .comment-form { padding: 20px; }
          .comment-item { padding: 16px; gap: 12px; }
          .comment-avatar { width: 40px; height: 40px; font-size: 0.8rem; }
        }
      `}</style>

      <div className="comments-header">
        <h2>💬 Comments</h2>
        <span className="comments-count">{comments.length}</span>
      </div>

      {/* Comment Form */}
      <form className="comment-form" onSubmit={submit}>
        <h3>✍ Leave a Comment</h3>
        <div className="comment-form-row">
          <div className="comment-field">
            <label>Your Name *</label>
            <input
              type="text"
              required
              maxLength="60"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="comment-field">
            <label>Email (not published) *</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="comment-field">
          <label>Your Comment *</label>
          <textarea
            required
            maxLength="1000"
            placeholder="Share your thoughts or ask a question..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <button type="submit" className="comment-submit-btn" disabled={submitting}>
          {submitting ? '⏳ Submitting...' : '🚀 Post Comment'}
        </button>

        {status.msg && (
          <div className={`comment-status ${status.type}`}>{status.msg}</div>
        )}
      </form>

      {/* Comment List */}
      <div className="comment-list">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-avatar">{initials(c.name)}</div>
              <div className="comment-body">
                <div className="comment-head">
                  <span className="comment-name">{c.name}</span>
                  <span className="comment-date">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="comment-text">{c.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-comments">
            <span>💭</span>
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </section>
  );
}