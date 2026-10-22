import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getImageUrl } from '../api';
import logo from '../assets/logo.jpeg';
import './Partners.css';

const INITIAL_FORM = {
  businessName: '',
  ownerName: '',
  phone: '',
  email: '',
  state: '',
  city: '',
  address: '',
  serviceCategory: '',
  description: '',
  serviceAreas: '',
  experienceYears: '',
  serviceHours: '',
  priceRange: ''
};

const CATEGORIES = [
  { id: 'All', label: 'All Services', icon: '⚡' },
  { id: 'AC Repair & Service', label: 'AC Repair', icon: '❄️' },
  { id: 'Refrigerator Repair', label: 'Refrigerator', icon: '🧊' },
  { id: 'Washing Machine Repair', label: 'Washing Machine', icon: '🧺' },
  { id: 'Microwave Repair', label: 'Microwave', icon: '📻' },
  { id: 'Multi-appliance Service', label: 'Multi-Appliance', icon: '🛠️' }
];

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersError, setPartnersError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [form, setForm] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal State
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    let active = true;
    API.get('/api/businesses')
      .then((response) => {
        if (active) setPartners(response.data.data || []);
      })
      .catch(() => {
        if (active) setPartnersError('We could not load partner listings. Please try again later.');
      })
      .finally(() => {
        if (active) setPartnersLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Handle escape key and scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPartner(null);
    };
    if (selectedPartner) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPartner]);

  const handleImageChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setImage(selected);
    setImagePreview(selected ? URL.createObjectURL(selected) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);

      const response = await API.post('/api/businesses/register', data);
      setMessage({ type: 'success', text: response.data.message });
      setForm(INITIAL_FORM);
      setImage(null);
      setImagePreview('');
      event.target.reset();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Your listing could not be submitted. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-filled WhatsApp inquiry link builder
  const getWhatsAppUrl = (partner) => {
    if (!partner?.phone) return '';
    let cleanPhone = partner.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = `91${cleanPhone.slice(1)}`;
    }

    const text = `Hello ${partner.ownerName || partner.businessName},\nI found your business profile on *Chintu Cool AC Service*.\n\nI want to inquire about your *${partner.serviceCategory || 'repair'}* services in *${partner.city || 'my city'}*. Are you available for a doorstep visit?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Multi-Filter: Active Category + Text Search
  const normalizedSearch = search.trim().toLowerCase();
  const visiblePartners = partners.filter((partner) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (partner.serviceCategory &&
        partner.serviceCategory.toLowerCase().includes(activeCategory.toLowerCase()));

    const matchesSearch = [
      partner.businessName,
      partner.ownerName,
      partner.city,
      partner.state,
      partner.serviceCategory
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="partners-page">
      <header className="partners-nav">
        <Link to="/" className="partners-logo">
          <img src={logo} alt="Chintu Cool logo" />
          <span>Chintu Cool AC Service</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/partners" aria-current="page">Partners</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a className="partners-call" href="tel:+919354397318">Call Now</a>
      </header>

      <section className="partners-hero">
        <p className="partners-eyebrow">LOCAL APPLIANCE EXPERTS</p>
        <h1>Meet trusted service partners near you</h1>
        <p>Explore verified technicians and appliance specialists, or list your repair business in our directory.</p>
        <a href="#partner-form" className="partners-primary-button">List your business</a>
      </section>

      <section className="partners-directory" aria-labelledby="directory-title">
        <div className="partners-section-heading">
          <div>
            <p className="partners-eyebrow">OUR NETWORK</p>
            <h2 id="directory-title">Service partners</h2>
          </div>
          <label className="partners-search">
            <span className="sr-only">Search partners</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by city, business, or technician"
            />
          </label>
        </div>

        {/* Quick Category Tabs */}
        <div className="partner-category-tabs" role="tablist" aria-label="Filter partners by service">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'All'
                ? partners.length
                : partners.filter((p) =>
                    p.serviceCategory?.toLowerCase().includes(cat.id.toLowerCase())
                  ).length;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`partner-tab-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="tab-icon" aria-hidden="true">{cat.icon}</span>
                <span className="tab-label">{cat.label}</span>
                <span className="tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {partnersLoading ? (
          <p className="partners-state">Loading approved partners…</p>
        ) : partnersError ? (
          <p className="partners-state partners-error">{partnersError}</p>
        ) : visiblePartners.length ? (
          <div className="partners-grid">
            {visiblePartners.map((partner) => (
              <article className="partner-card" key={partner._id}>
                {partner.imageUrl ? (
                  <img
                    className="partner-image"
                    src={getImageUrl(partner.imageUrl)}
                    alt={`${partner.businessName} workshop`}
                  />
                ) : (
                  <div className="partner-image partner-image-placeholder" aria-hidden="true">🔧</div>
                )}
                <div className="partner-card-body">
                  <p className="partner-category">{partner.serviceCategory}</p>
                  <h3>{partner.businessName}</h3>
                  <p className="partner-technician">Technician: {partner.ownerName}</p>
                  <p className="partner-location">📍 {[partner.city, partner.state].filter(Boolean).join(', ')}</p>
                  
                  {partner.description && (
                    <p className="partner-description">
                      {partner.description.length > 110
                        ? `${partner.description.slice(0, 110)}...`
                        : partner.description}
                    </p>
                  )}

                  <div className="partner-details">
                    {partner.experienceYears > 0 && <span>{partner.experienceYears} years’ exp</span>}
                    {partner.priceRange && <span>Pricing: {partner.priceRange}</span>}
                  </div>

                  <div className="partner-actions">
                    <button
                      type="button"
                      className="partner-view-detail-btn"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      View Details 🔍
                    </button>
                    <a href={`tel:${partner.phone}`} className="partner-call-btn">Call Now</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="partners-empty">
            <span aria-hidden="true">🛠️</span>
            <h3>{normalizedSearch || activeCategory !== 'All' ? 'No matching partners found' : 'Be the first service partner'}</h3>
            <p>
              {normalizedSearch || activeCategory !== 'All'
                ? 'Try picking another service tab or searching for another city.'
                : 'New technician profiles will appear here after administrator verification.'}
            </p>
          </div>
        )}
      </section>

      {/* VIEW DETAILS & CONTACT MODAL */}
      {selectedPartner && (
        <div className="partner-modal-overlay" onClick={() => setSelectedPartner(null)} role="dialog" aria-modal="true">
          <div className="partner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="partner-modal-close"
              onClick={() => setSelectedPartner(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="partner-modal-header">
              {selectedPartner.imageUrl ? (
                <img
                  className="partner-modal-image"
                  src={getImageUrl(selectedPartner.imageUrl)}
                  alt={selectedPartner.businessName}
                />
              ) : (
                <div className="partner-modal-image partner-image-placeholder" aria-hidden="true">🔧</div>
              )}
              <div className="partner-modal-header-info">
                <span className="partner-category">{selectedPartner.serviceCategory}</span>
                <h2>{selectedPartner.businessName}</h2>
                <p className="partner-technician"><strong>Lead Technician:</strong> {selectedPartner.ownerName}</p>
                <p className="partner-location">📍 {[selectedPartner.address, selectedPartner.city, selectedPartner.state].filter(Boolean).join(', ')}</p>
              </div>
            </div>

            <div className="partner-modal-body">
              <div className="partner-modal-section">
                <h4>About Business</h4>
                <p>{selectedPartner.description || 'No detailed description provided by the business owner.'}</p>
              </div>

              <div className="partner-modal-meta-grid">
                {selectedPartner.experienceYears > 0 && (
                  <div className="partner-meta-item">
                    <strong>Experience:</strong>
                    <span>{selectedPartner.experienceYears} Years</span>
                  </div>
                )}
                {selectedPartner.priceRange && (
                  <div className="partner-meta-item">
                    <strong>Typical Pricing:</strong>
                    <span>{selectedPartner.priceRange}</span>
                  </div>
                )}
                {selectedPartner.serviceHours && (
                  <div className="partner-meta-item">
                    <strong>Service Hours:</strong>
                    <span>{selectedPartner.serviceHours}</span>
                  </div>
                )}
                {selectedPartner.serviceAreas && (
                  <div className="partner-meta-item">
                    <strong>Areas Served:</strong>
                    <span>{selectedPartner.serviceAreas}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Phone + WhatsApp + Email */}
              <div className="partner-modal-actions">
                <a className="partners-primary-button" href={`tel:${selectedPartner.phone}`}>
                  📞 Call {selectedPartner.phone}
                </a>
                <a
                  className="partner-whatsapp-button"
                  href={getWhatsAppUrl(selectedPartner)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Chat on WhatsApp
                </a>
                {selectedPartner.email && (
                  <a className="partner-email-button" href={`mailto:${selectedPartner.email}`}>
                    ✉️ Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTNER REGISTRATION FORM */}
      <section className="partner-form-section" id="partner-form">
        <div className="partner-form-intro">
          <p className="partners-eyebrow">GROW WITH OUR NETWORK</p>
          <h2>Add your appliance service business</h2>
          <p>Share your workshop details, pricing, and contact numbers. Verified listings appear in the directory.</p>
        </div>

        <form className="partner-form" onSubmit={handleSubmit}>
          <div className="partner-form-grid">
            <label>Business name *
              <input required maxLength="120" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </label>
            <label>Technician / owner name *
              <input required maxLength="100" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
            </label>
            <label>Phone number *
              <input required type="tel" maxLength="20" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>Email
              <input type="email" maxLength="150" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>State *
              <input required maxLength="80" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </label>
            <label>City *
              <input required maxLength="80" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label>Street address
              <input maxLength="200" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label>Primary service *
              <select required value={form.serviceCategory} onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })}>
                <option value="">Choose a service</option>
                <option>AC Repair &amp; Service</option>
                <option>Refrigerator Repair</option>
                <option>Washing Machine Repair</option>
                <option>Microwave Repair</option>
                <option>Multi-appliance Service</option>
                <option>Other</option>
              </select>
            </label>
            <label>Years of experience
              <input type="number" min="0" max="80" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
            </label>
            <label>Service area
              <input maxLength="200" placeholder="Neighbourhoods or sectors served" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} />
            </label>
            <label>Working hours
              <input maxLength="100" placeholder="e.g. Mon–Sat, 9 am–7 pm" value={form.serviceHours} onChange={(e) => setForm({ ...form, serviceHours: e.target.value })} />
            </label>
            <label>Typical price range
              <input maxLength="100" placeholder="e.g. Starting from ₹499" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} />
            </label>
            <label className="partner-full-width">About your business *
              <textarea required rows="4" maxLength="1500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your background, specialty brands, and service warranties." />
            </label>
            <label className="partner-full-width">Business photo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
              <small>Upload workshop or technician photo (JPG, PNG, or WEBP up to 5 MB).</small>
            </label>
          </div>

          {imagePreview && <img className="partner-upload-preview" src={imagePreview} alt="Selected business preview" />}
          {message && <p className={`partner-form-message ${message.type}`} role="status">{message.text}</p>}
          <button className="partners-primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
          <p className="partner-review-note">Your listing is verified by our team before publishing publicly.</p>
        </form>
      </section>

      <footer className="partners-footer">
        <Link to="/">Chintu Cool AC Service</Link>
        <span>Need service? <Link to="/contact">Contact our team</Link></span>
      </footer>
    </main>
  );
}