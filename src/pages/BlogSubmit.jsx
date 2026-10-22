import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import logo from '../assets/logo.jpeg';
import './BlogSubmit.css';

const CATEGORIES = [
  'AC Repair',
  'Refrigerator',
  'Washing Machine',
  'Microwave',
  'Preventive Maintenance',
  'Tips & Tricks',
  'News',
  'Other'
];

export default function BlogSubmit() {
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: 'Tips & Tricks',
    excerpt: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await API.post('/api/blogs/submit', form);
      setMessage({ type: 'success', text: response.data.message });
      setForm({
        title: '',
        author: '',
        category: 'Tips & Tricks',
        excerpt: '',
        content: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Your story could not be submitted. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="blog-submit-page">
      <header className="blog-submit-nav">
        <Link to="/" className="blog-submit-logo">
          <img src={logo} alt="" />
          <span>Chintu Cool AC Service</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/blog">All stories</Link>
        </nav>
      </header>

      <section className="blog-submit-wrap">
        <Link className="blog-submit-back" to="/blog">← Back to stories</Link>
        <p className="blog-submit-eyebrow">SHARE WITH THE COMMUNITY</p>
        <h1>Write a story</h1>
        <p className="blog-submit-lead">Share an appliance tip, repair experience, or lesson learned. Our team reviews every submission before it is published.</p>

        <form className="blog-submit-form" onSubmit={handleSubmit}>
          <label>Story title *
            <input
              required
              maxLength="200"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Give your story a clear title"
            />
          </label>
          <div className="blog-submit-row">
            <label>Your name *
              <input
                required
                maxLength="100"
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
                placeholder="Name shown with your story"
              />
            </label>
            <label>Category *
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <label>Short summary
            <textarea
              rows="3"
              maxLength="300"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              placeholder="A sentence or two to introduce your article"
            />
          </label>
          <label>Story *
            <textarea
              required
              rows="12"
              maxLength="20000"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="Write your story here. Keep it useful, respectful, and based on your own experience."
            />
          </label>

          {message && (
            <div className={`blog-submit-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
              <p>{message.text}</p>
              {message.type === 'success' && <Link to="/blog">Return to the blog</Link>}
            </div>
          )}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
          <p className="blog-submit-note">Submissions are reviewed by an administrator and are not public until approved.</p>
        </form>
      </section>
    </main>
  );
}
