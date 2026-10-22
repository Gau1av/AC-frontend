import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API, { getImageUrl } from '../api';
import CommentsSection from '../components/CommentsSection';
import NewsletterForm from '../components/NewsLetterForm';

export default function BlogDetail() {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        /* Supporting Images Styling */
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
        .blog-gallery-card:hover img {
          transform: scale(1.03);
        }

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
        .blog-detail-author-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .blog-author-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 900;
          font-size: 1.1rem;
          box-shadow: 0 8px 18px rgba(2, 132, 199, 0.3);
        }
        .blog-author-info strong {
          display: block;
          color: #0f172a;
          font-weight: 800;
          font-size: 0.95rem;
        }
        .blog-author-info span {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .blog-share-group {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .blog-share-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          margin-right: 4px;
        }
        .blog-share-btn {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s ease;
        }
        .blog-share-btn:hover {
          background: #0284c7;
          color: #fff;
          transform: translateY(-2px);
          border-color: transparent;
          box-shadow: 0 8px 16px rgba(2, 132, 199, 0.3);
        }

        .blog-related {
          max-width: 1080px;
          margin: 60px auto 0;
          padding: 0 20px;
        }
        .blog-related-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }
        .blog-related-title::before {
          content: "";
          width: 4px;
          height: 24px;
          background: linear-gradient(180deg, #ff8a00, #facc15);
          border-radius: 99px;
        }
        .blog-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
        }

        .related-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
          border: 1px solid #e2e8f0;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: all 0.3s ease;
        }
        .related-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
        }
        .related-card-img {
          height: 150px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          display: grid;
          place-items: center;
          font-size: 2.5rem;
          opacity: 0.85;
        }
        .related-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .related-card-body { padding: 16px 18px 18px; }
        .related-card-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .related-card-meta {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
        }

        .blog-detail-cta {
          max-width: 860px;
          margin: 40px auto 0;
          padding: 0 20px;
        }
        .blog-cta-box {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          padding: 34px 32px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(2, 132, 199, 0.25);
          position: relative;
          overflow: hidden;
        }
        .blog-cta-box::before {
          content: "";
          position: absolute;
          top: -50px; right: -40px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
          border-radius: 50%;
        }
        .blog-cta-box h3 {
          margin: 0 0 8px;
          font-size: 1.3rem;
          font-weight: 900;
          position: relative;
        }
        .blog-cta-box p {
          margin: 0 0 20px;
          color: #cbd5e1;
          font-size: 0.95rem;
          position: relative;
        }
        .blog-cta-btn {
          display: inline-block;
          background: #ffffff;
          color: #0284c7;
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 800;
          text-decoration: none;
          font-size: 0.92rem;
          position: relative;
          transition: all 0.25s ease;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .blog-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.25);
        }

        .blog-newsletter-wrap {
          max-width: 720px;
          margin: 50px auto 0;
          padding: 0 20px;
        }

        @media (max-width: 768px) {
          .blog-detail-hero { padding: 30px 18px 90px; }
          .blog-detail-title { font-size: 1.55rem; }
          .blog-detail-container { margin-top: -50px; }
          .blog-detail-cover { height: 240px; border-radius: 14px; }
          .blog-detail-article { padding: 28px 22px; border-radius: 16px; }
          .blog-detail-content p { font-size: 0.98rem; }
          .blog-detail-content h1 { font-size: 1.35rem; }
          .blog-detail-content h2 { font-size: 1.15rem; }
          .blog-detail-excerpt { font-size: 1rem; }
          .blog-detail-footer { flex-direction: column; align-items: flex-start; }
          .blog-related-title { font-size: 1.25rem; }
          .blog-cta-box { padding: 26px 22px; border-radius: 16px; }
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

          {/* SUPPORTING GALLERY IMAGES */}
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
                href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
              >
                💬
              </a>
              <a
                className="blog-share-btn"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Twitter"
              >
                🐦
              </a>
              <a
                className="blog-share-btn"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
              >
                📘
              </a>
              <button
                className="blog-share-btn"
                title="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                🔗
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* COMMENTS */}
      <CommentsSection blogId={blog._id} initialComments={comments} />

      {/* CTA */}
      <div className="blog-detail-cta">
        <div className="blog-cta-box">
          <h3>Need Expert Appliance Help?</h3>
          <p>Book a certified technician in minutes. Same-day service available.</p>
          <Link to="/" className="blog-cta-btn">📞 Book a Service</Link>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="blog-newsletter-wrap">
        <NewsletterForm />
      </div>

      {/* RELATED */}
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
                  <h3 className="related-card-title">{r.title}</h3>
                  <div className="related-card-meta">
                    {r.category} •{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}