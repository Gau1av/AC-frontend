import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API, { getImageUrl } from '../api';

export default function BlogDetail() {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment submission state
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/api/blogs/${slug}`);
        setBlog(res.data.data);
        setRelated(res.data.related || []);
        setComments(res.data.comments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Blog not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.email || !commentForm.message) return;
    setCommentSubmitting(true);
    setCommentSuccess('');
    try {
      await API.post(`/api/blogs/${blog?._id || slug}/comments`, commentForm);
      setCommentSuccess('Comment submitted! It will appear once approved by admin.');
      setCommentForm({ name: '', email: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="spinner" />
        <p>Loading article...</p>
        <style>{`
          .blog-detail-loading {
            min-height: 60vh;
            display: grid;
            place-items: center;
            color: #64748b;
            font-weight: 600;
          }
          .spinner {
            width: 40px; height: 40px;
            border: 4px solid #e2e8f0;
            border-top-color: #0284c7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 14px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-not-found">
        <div className="notfound-box">
          <span style={{ fontSize: '3.5rem' }}>😕</span>
          <h1>Article Not Found</h1>
          <p>{error || "The blog post you're looking for doesn't exist or has been removed."}</p>
          <Link to="/blog" className="notfound-btn">← Back to Blog</Link>
        </div>
        <style>{`
          .blog-not-found {
            min-height: 70vh;
            display: grid;
            place-items: center;
            padding: 40px 20px;
            background: #f8fafc;
          }
          .notfound-box {
            text-align: center;
            max-width: 480px;
            background: #fff;
            padding: 50px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
            border: 1px solid #e2e8f0;
          }
          .notfound-box h1 {
            font-size: 1.6rem;
            color: #0f172a;
            margin: 16px 0 10px;
            font-weight: 800;
          }
          .notfound-box p { color: #64748b; margin-bottom: 24px; line-height: 1.6; }
          .notfound-btn {
            display: inline-block;
            padding: 12px 26px;
            background: linear-gradient(135deg, #0284c7, #0369a1);
            color: #fff;
            text-decoration: none;
            font-weight: 700;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
          }
        `}</style>
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil((blog.content || '').split(/\s+/).filter(Boolean).length / 200));
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const renderContent = (content) =>
    (content || '').split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith('## ')) return <h2 key={i}>{trimmed.replace('## ', '')}</h2>;
      if (trimmed.startsWith('# ')) return <h1 key={i}>{trimmed.replace('# ', '')}</h1>;
      if (trimmed.startsWith('- ')) return <li key={i}>{trimmed.replace('- ', '')}</li>;
      return <p key={i}>{trimmed}</p>;
    });

  return (
    <div className="blog-detail-page">
      <style>{`
        .blog-detail-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 70px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .blog-detail-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          padding: 40px 20px 100px;
          position: relative;
          overflow: hidden;
        }
        .blog-detail-hero::before {
          content: "";
          position: absolute;
          top: -60px; right: -40px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,138,0,0.22), transparent 70%);
          border-radius: 50%;
        }
        .blog-detail-hero-inner {
          max-width: 860px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .blog-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 14px;
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          margin-bottom: 24px;
          transition: all 0.2s ease;
        }
        .blog-back-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
          transform: translateX(-3px);
        }

        .blog-detail-category {
          display: inline-block;
          background: linear-gradient(135deg, #ff8a00, #f97316);
          color: #fff;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
          box-shadow: 0 6px 18px rgba(255, 138, 0, 0.35);
        }
        .blog-detail-title {
          font-size: 2.3rem;
          font-weight: 900;
          margin: 0 0 20px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .blog-detail-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          color: #cbd5e1;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .blog-detail-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .blog-detail-meta-item strong { color: #fff; }

        .blog-detail-container {
          max-width: 860px;
          margin: -60px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }

        .blog-detail-cover {
          width: 100%;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
          margin-bottom: 32px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        }
        .blog-detail-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-detail-article {
          background: #ffffff;
          border-radius: 20px;
          padding: 44px 48px;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.9);
          line-height: 1.8;
          color: #334155;
        }
        .blog-detail-excerpt {
          font-size: 1.1rem;
          color: #475569;
          font-weight: 600;
          font-style: italic;
          border-left: 4px solid #ff8a00;
          padding: 4px 0 4px 18px;
          margin-bottom: 28px;
          line-height: 1.65;
        }
        .blog-detail-content p {
          font-size: 1.05rem;
          color: #334155;
          margin: 0 0 18px;
        }
        .blog-detail-content h1,
        .blog-detail-content h2 {
          color: #0f172a;
          font-weight: 800;
          margin: 32px 0 14px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .blog-detail-content h1 { font-size: 1.75rem; }
        .blog-detail-content h2 { font-size: 1.4rem; }
        .blog-detail-content li {
          list-style: none;
          position: relative;
          padding-left: 26px;
          margin-bottom: 10px;
          font-size: 1.05rem;
          color: #334155;
        }
        .blog-detail-content li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 800;
          font-size: 1.05rem;
        }

        /* Gallery Grid */
        .blog-gallery-wrap {
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px dashed #e2e8f0;
        }
        .blog-gallery-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
        }
        .blog-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .blog-gallery-card {
          height: 220px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          background: #f1f5f9;
        }
        .blog-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .blog-gallery-card:hover img { transform: scale(1.03); }

        .blog-detail-footer {
          margin-top: 40px;
          padding-top: 28px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .blog-detail-author-box { display: flex; align-items: center; gap: 14px; }
        .blog-author-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          display: grid; place-items: center; color: #fff;
          font-weight: 900; font-size: 1.1rem;
          box-shadow: 0 8px 18px rgba(2, 132, 199, 0.3);
        }
        .blog-author-info strong { display: block; color: #0f172a; font-weight: 800; font-size: 0.95rem; }
        .blog-author-info span { color: #64748b; font-size: 0.8rem; font-weight: 600; }

        .blog-share-group { display: flex; gap: 8px; align-items: center; }
        .blog-share-label { font-size: 0.8rem; font-weight: 700; color: #64748b; margin-right: 4px; }
        .blog-share-btn {
          width: 38px; height: 38px; display: grid; place-items: center;
          border-radius: 10px; background: #f1f5f9; border: 1px solid #e2e8f0;
          font-size: 1rem; cursor: pointer; text-decoration: none; color: #475569;
          transition: all 0.2s ease;
        }
        .blog-share-btn:hover {
          background: #0284c7; color: #fff; transform: translateY(-2px);
          border-color: transparent; box-shadow: 0 8px 16px rgba(2, 132, 199, 0.3);
        }

        /* Embedded Comments Section */
        .embedded-comments-section {
          max-width: 860px;
          margin: 40px auto 0;
          padding: 0 20px;
        }
        .comments-box {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
        }
        .comments-box h3 { margin: 0 0 20px; font-size: 1.3rem; font-weight: 800; color: #0f172a; }
        .comment-field { margin-bottom: 14px; }
        .comment-field label { display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 5px; }
        .comment-field input, .comment-field textarea {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid #cbd5e1; font-size: 0.9rem; font-family: inherit;
          box-sizing: border-box; outline: none;
        }
        .comment-field input:focus, .comment-field textarea:focus {
          border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
        }
        .btn-submit-comment {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff; border: none; padding: 11px 24px; border-radius: 10px;
          font-weight: 700; cursor: pointer; transition: all 0.2s ease;
        }
        .btn-submit-comment:disabled { opacity: 0.6; cursor: not-allowed; }

        .blog-detail-cta {
          max-width: 860px;
          margin: 40px auto 0;
          padding: 0 20px;
        }
        .blog-cta-box {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff; padding: 34px 32px; border-radius: 20px;
          text-align: center; box-shadow: 0 20px 40px rgba(2, 132, 199, 0.25);
        }
        .blog-cta-btn {
          display: inline-block; background: #ffffff; color: #0284c7;
          padding: 12px 28px; border-radius: 10px; font-weight: 800;
          text-decoration: none; font-size: 0.92rem; margin-top: 14px;
        }

        .blog-related {
          max-width: 860px;
          margin: 60px auto 0;
          padding: 0 20px;
        }
        .blog-related-title {
          font-size: 1.4rem; font-weight: 900; color: #0f172a; margin-bottom: 20px;
        }
        .blog-related-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;
        }
        .related-card {
          background: #fff; border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;
          text-decoration: none; color: inherit; display: block;
        }
        .related-card-img {
          height: 140px; background: #e0f2fe; display: grid; place-items: center; font-size: 2rem;
        }
        .related-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .related-card-body { padding: 14px 16px; }

        @media (max-width: 768px) {
          .blog-detail-title { font-size: 1.6rem; }
          .blog-detail-cover { height: 230px; }
          .blog-detail-article { padding: 24px 20px; }
        }
      `}</style>

      {/* HERO */}
      <div className="blog-detail-hero">
        <div className="blog-detail-hero-inner">
          <Link to="/blog" className="blog-back-btn">← Back to Blog</Link>
          <div>
            <span className="blog-detail-category">{blog.category}</span>
          </div>
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <span className="blog-detail-meta-item">
              ✍ By <strong>{blog.author}</strong>
            </span>
            <span className="blog-detail-meta-item">📅 {formattedDate}</span>
            <span className="blog-detail-meta-item">⏱ {readTime} min read</span>
            {blog.views > 0 && (
              <span className="blog-detail-meta-item">👁 {blog.views} views</span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="blog-detail-container">
        {blog.imageUrl && (
          <div className="blog-detail-cover">
            <img src={getImageUrl(blog.imageUrl)} alt={blog.title} />
          </div>
        )}

        <article className="blog-detail-article">
          {blog.excerpt && (
            <div className="blog-detail-excerpt">{blog.excerpt}</div>
          )}

          <div className="blog-detail-content">
            {renderContent(blog.content)}
          </div>

          {/* GALLERY IMAGES */}
          {blog.galleryImages && blog.galleryImages.length > 0 && (
            <div className="blog-gallery-wrap">
              <h3 className="blog-gallery-title">📸 Supporting Photos & Inspection</h3>
              <div className="blog-gallery-grid">
                {blog.galleryImages.map((img, i) => (
                  <div key={i} className="blog-gallery-card">
                    <img src={getImageUrl(img)} alt={`Supporting visual ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="blog-detail-footer">
            <div className="blog-detail-author-box">
              <div className="blog-author-avatar">
                {blog.author?.charAt(0).toUpperCase()}
              </div>
              <div className="blog-author-info">
                <strong>{blog.author}</strong>
                <span>Certified Technician • Chintu AC Service</span>
              </div>
            </div>

            <div className="blog-share-group">
              <span className="blog-share-label">Share:</span>
              <a
                className="blog-share-btn"
                href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
              >
                💬
              </a>
              <button
                className="blog-share-btn"
                title="Copy link"
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                🔗
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* INLINE ROBUST COMMENTS SECTION */}
      <div className="embedded-comments-section">
        <div className="comments-box">
          <h3>💬 Comments & Discussion ({comments.length})</h3>
          
          {commentSuccess && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: 600 }}>
              {commentSuccess}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '24px' }}>
            <div className="comment-field">
              <label>Your Name *</label>
              <input
                type="text" required placeholder="Enter your full name"
                value={commentForm.name}
                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
              />
            </div>
            <div className="comment-field">
              <label>Your Email *</label>
              <input
                type="email" required placeholder="example@gmail.com"
                value={commentForm.email}
                onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
              />
            </div>
            <div className="comment-field">
              <label>Your Comment *</label>
              <textarea
                rows="3" required placeholder="Write your question or thoughts here..."
                value={commentForm.message}
                onChange={(e) => setCommentForm({ ...commentForm, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-submit-comment" disabled={commentSubmitting}>
              {commentSubmitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </form>

          {comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {comments.map((c) => (
                <div key={c._id || Math.random()} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: '#0f172a' }}>{c.name}</strong>
                    <small style={{ color: '#64748b' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</small>
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem' }}>{c.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No approved comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="blog-detail-cta">
        <div className="blog-cta-box">
          <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>Need Expert Appliance Help?</h3>
          <p style={{ margin: '0 0 16px', color: '#e0f2fe' }}>Book a certified technician in minutes. Same-day service available.</p>
          <Link to="/" className="blog-cta-btn">📞 Book a Service</Link>
        </div>
      </div>

      {/* RELATED ARTICLES */}
      {related.length > 0 && (
        <div className="blog-related">
          <h2 className="blog-related-title">Related Articles</h2>
          <div className="blog-related-grid">
            {related.map((r) => (
              <Link key={r._id} to={`/blog/${r.slug || r._id}`} className="related-card">
                <div className="related-card-img">
                  {r.imageUrl ? <img src={getImageUrl(r.imageUrl)} alt={r.title} /> : '📝'}
                </div>
                <div className="related-card-body">
                  <h4 style={{ margin: '0 0 6px', color: '#0f172a' }}>{r.title}</h4>
                  <small style={{ color: '#64748b' }}>{r.category}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}