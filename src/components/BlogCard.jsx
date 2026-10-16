import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

export default function BlogCard({ blog }) {
  const readTime = blog.content
    ? Math.max(1, Math.ceil(blog.content.split(' ').length / 200))
    : 3;

  return (
    <Link to={`/blog/${blog.slug}`} className="blog-card-link">
      <article className="blog-card">
        <div className="blog-card-image">
          {blog.imageUrl ? (
            <img src={getImageUrl(blog.imageUrl)} alt={blog.title} loading="lazy" />
          ) : (
            <div className="blog-card-placeholder">📝</div>
          )}
          <span className="blog-card-category">{blog.category}</span>
        </div>

        <div className="blog-card-body">
          <h3 className="blog-card-title">{blog.title}</h3>

          <p className="blog-card-excerpt">
            {blog.excerpt ||
              (blog.content && blog.content.substring(0, 130) + '...')}
          </p>

          <div className="blog-card-meta">
            <span className="blog-card-author">✍ {blog.author}</span>
            <span className="blog-card-dot">•</span>
            <span className="blog-card-readtime">⏱ {readTime} min</span>
          </div>

          <div className="blog-card-stats">
            <span className="blog-stat">
              👁 {blog.views || 0}
            </span>
            <span className="blog-stat">
              💬 {blog.commentCount || 0}
            </span>
            <span className="blog-stat blog-stat-date">
              📅{' '}
              {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>

          <div className="blog-card-readmore">
            Read More <span className="arrow">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}