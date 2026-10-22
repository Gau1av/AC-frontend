import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getImageUrl } from '../api';
import logo from '../assets/logo.jpeg';
import './BlogIndex.css';

export default function BlogIndex() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/api/blogs', { params: { search: search.trim(), page, limit: 9 } })
      .then((response) => {
        if (!active) return;
        setBlogs((existing) => page === 1 ? response.data.data || [] : [...existing, ...(response.data.data || [])]);
        setPages(response.data.pagination?.pages || 1);
      })
      .catch(() => {
        if (active) setError('We could not load stories right now. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, page]);

  const handleSearch = (event) => {
    setBlogs([]);
    setPage(1);
    setLoading(true);
    setError('');
    setSearch(event.target.value);
  };

  return (
    <main className="blog-index">
      <header className="blog-index-nav">
        <Link to="/" className="blog-index-logo">
          <img src={logo} alt="" />
          <span>Chintu Cool AC Service</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/blog" aria-current="page">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <section className="blog-index-hero">
        <p className="blog-index-eyebrow">COMMUNITY STORIES &amp; EXPERT ADVICE</p>
        <h1>Ideas, advice, and appliance know-how</h1>
        <p>Read practical stories from technicians and people who care for their appliances.</p>
        <Link className="blog-write-button" to="/blog/write">Write a story <span aria-hidden="true">→</span></Link>
      </section>

      <section className="blog-index-content">
        <div className="blog-index-toolbar">
          <div>
            <p className="blog-index-eyebrow">THE LATEST</p>
            <h2>From the community</h2>
          </div>
          <label>
            <span className="sr-only">Search stories</span>
            <input type="search" placeholder="Search stories" value={search} onChange={handleSearch} />
          </label>
        </div>

        {error ? (
          <p className="blog-index-message error" role="alert">{error}</p>
        ) : blogs.length ? (
          <div className="blog-index-grid">
            {blogs.map((blog) => (
              <article className="blog-index-card" key={blog._id}>
                <Link to={`/blog/${blog.slug}`} className="blog-index-card-image">
                  {blog.imageUrl
                    ? <img src={getImageUrl(blog.imageUrl)} alt="" loading="lazy" />
                    : <span aria-hidden="true">📝</span>}
                </Link>
                <div className="blog-index-card-content">
                  <p className="blog-index-category">{blog.category}</p>
                  <h3><Link to={`/blog/${blog.slug}`}>{blog.title}</Link></h3>
                  <p className="blog-index-excerpt">{blog.excerpt || blog.content?.slice(0, 150)}</p>
                  <div className="blog-index-meta">
                    <span>By {blog.author}</span>
                    {blog.createdAt && <time dateTime={blog.createdAt}>{new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>}
                  </div>
                  <Link className="blog-index-read-more" to={`/blog/${blog.slug}`}>Read story <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        ) : !loading ? (
          <div className="blog-index-empty">
            <span aria-hidden="true">📚</span>
            <h3>{search ? 'No stories found' : 'Stories are on the way'}</h3>
            <p>{search ? 'Try a different search phrase.' : 'Share what you know and help someone keep an appliance running.'}</p>
            {!search && <Link to="/blog/write" className="blog-write-button">Write the first story</Link>}
          </div>
        ) : null}

        {loading && <p className="blog-index-message">Loading stories…</p>}
        {!loading && page < pages && (
          <button
            className="blog-load-more"
            onClick={() => {
              setLoading(true);
              setPage((current) => current + 1);
            }}
          >
            Load more stories
          </button>
        )}
      </section>
    </main>
  );
}
