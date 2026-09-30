import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    serviceType: 'AC Service & Gas Charging',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const contactCards = [
    {
      icon: '📞',
      title: 'Call Us Directly',
      details: ['+91 93543 97318', '+91 85069 94651'],
      actionText: 'Dial Now',
      link: 'tel:+919354397318'
    },
    {
      icon: '💬',
      title: 'WhatsApp Support',
      details: ['Instant replies within 10 mins', 'Available 8 AM - 10 PM'],
      actionText: 'Chat on WhatsApp',
      link: 'https://wa.me/919354397318?text=Hello%20Chintu%20Cool,%20I%20need%20doorstep%20repair%20service.'
    },
    {
      icon: '✉️',
      title: 'Official Email',
      details: ['gaurav25543@gmail.com', 'support@chintucool.com'],
      actionText: 'Send Email',
      link: 'mailto:gaurav25543@gmail.com'
    },
    {
      icon: '📍',
      title: 'Service Hubs',
      details: ['Noida Sector 62 & 18', 'Covering Delhi, Gurgaon, NCR'],
      actionText: 'View Areas',
      link: '#service-map'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await axios.post('http://localhost:5000/api/inquiries', formData);
      if (res.data.success) {
        setStatus({
          type: 'success',
          text: 'Thank you! Your message has been received. Our technician will call you shortly.'
        });
        setFormData({
          name: '',
          mobile: '',
          email: '',
          city: '',
          serviceType: 'AC Service & Gas Charging',
          message: ''
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit inquiry. Please call us directly.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-root">
      {/* Dynamic Embedded CSS */}
      <style>{`
        :root {
          --primary: #0284c7;
          --primary-dark: #0369a1;
          --secondary: #0f172a;
          --accent: #38bdf8;
          --text-main: #334155;
          --text-muted: #64748b;
          --bg-surface: #ffffff;
          --bg-canvas: #f8fafc;
          --border: #e2e8f0;
          --success-bg: #ecfdf5;
          --success-border: #a7f3d0;
          --success-text: #065f46;
          --error-bg: #fef2f2;
          --error-border: #fecaca;
          --error-text: #991b1b;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 30px rgba(2,132,199,0.12);
          --radius: 12px;
          --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .contact-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--text-main);
          background-color: var(--bg-canvas);
          min-height: 100vh;
        }

        /* Top Navbar */
        .contact-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 6%;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .contact-logo {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-logo span {
          color: var(--primary);
          font-size: 1.4rem;
        }

        .contact-nav {
          display: flex;
          gap: 1.6rem;
        }

        .contact-nav a {
          text-decoration: none;
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .contact-nav a:hover,
        .contact-nav a.active {
          color: var(--primary);
        }

        .contact-call-btn {
          background-color: #ecfdf5;
          color: #059669;
          text-decoration: none;
          font-weight: 700;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: 1px solid #a7f3d0;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .contact-call-btn:hover {
          background-color: #059669;
          color: #ffffff;
        }

        /* Header Hero */
        .contact-header {
          text-align: center;
          padding: 4.5rem 1.5rem 3.5rem;
          background: linear-gradient(180deg, #e0f2fe 0%, var(--bg-canvas) 100%);
        }

        .header-badge {
          display: inline-block;
          background-color: #bae6fd;
          color: var(--primary-dark);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 0.35rem 0.9rem;
          border-radius: 50px;
          margin-bottom: 1rem;
        }

        .contact-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }

        .contact-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 650px;
          margin: 0 auto;
        }

        /* Cards Grid */
        .cards-container {
          max-width: 1200px;
          margin: -1.5rem auto 3rem;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .contact-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: var(--transition);
        }

        .contact-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .card-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          background: #f0f9ff;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .contact-card h3 {
          font-size: 1.15rem;
          color: var(--secondary);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .card-detail {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .card-action {
          margin-top: auto;
          padding-top: 1.25rem;
          text-decoration: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .card-action:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Form + Map Split */
        .contact-layout {
          max-width: 1200px;
          margin: 0 auto 5rem;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2.5rem;
        }

        .form-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2.5rem;
          box-shadow: var(--shadow-sm);
        }

        .form-card h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 0.4rem;
        }

        .form-card .sub {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1.8rem;
        }

        .field-group {
          margin-bottom: 1.2rem;
          display: flex;
          flex-direction: column;
        }

        .field-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 0.4rem;
        }

        .form-card input,
        .form-card select,
        .form-card textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.95rem;
          background: #ffffff;
          box-sizing: border-box;
          transition: var(--transition);
          outline: none;
        }

        .form-card input:focus,
        .form-card select:focus,
        .form-card textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        .grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .submit-btn {
          width: 100%;
          background: var(--primary);
          color: #ffffff;
          padding: 0.9rem;
          border-radius: 8px;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }

        .submit-btn:hover {
          background: var(--primary-dark);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .alert-box {
          padding: 0.85rem 1.1rem;
          border-radius: 8px;
          font-size: 0.92rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-box.success {
          background-color: var(--success-bg);
          border: 1px solid var(--success-border);
          color: var(--success-text);
        }

        .alert-box.error {
          background-color: var(--error-bg);
          border: 1px solid var(--error-border);
          color: var(--error-text);
        }

        /* Map & Info Panel */
        .info-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .map-wrapper {
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          height: 320px;
          background: #e2e8f0;
        }

        .map-wrapper iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }

        .hours-box {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .hours-box h3 {
          font-size: 1.1rem;
          color: var(--secondary);
          margin-bottom: 0.8rem;
          font-weight: 700;
        }

        .hours-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          border-bottom: 1px dashed var(--border);
        }

        .hours-row:last-child {
          border-bottom: none;
        }

        .hours-row span:last-child {
          font-weight: 600;
          color: var(--primary-dark);
        }

        /* Footer */
        .contact-footer {
          background-color: var(--secondary);
          color: #94a3b8;
          padding: 3.5rem 1.5rem 1.5rem;
          text-align: center;
        }

        .contact-footer p {
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        /* Responsiveness */
        @media (max-width: 868px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
          .grid-2col {
            grid-template-columns: 1fr;
          }
          .contact-header h1 {
            font-size: 2rem;
          }
          .contact-navbar {
            flex-direction: column;
            gap: 0.8rem;
          }
        }
      `}</style>

      {/* Navbar */}
      <header className="contact-navbar">
        <div className="contact-logo">
          <span>❄</span> Chintu Cool AC Service
        </div>
        <nav className="contact-nav">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact" className="active">Contact</Link>
        </nav>
        <a className="contact-call-btn" href="tel:+919354397318">
          📞 93543 97318
        </a>
      </header>

      {/* Hero Banner */}
      <section className="contact-header">
        <span className="header-badge">GET IN TOUCH</span>
        <h1>We Are Here to Assist Your Appliance Needs</h1>
        <p>
          Need urgent cooling repair or routine laundry appliance maintenance? 
          Reach out directly or send us an inquiry for express doorstep response.
        </p>
      </section>

      {/* Contact Channels Grid */}
      <div className="cards-container">
        {contactCards.map((c, i) => (
          <div key={i} className="contact-card">
            <div className="card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            {c.details.map((d, dIdx) => (
              <p key={dIdx} className="card-detail">{d}</p>
            ))}
            <a href={c.link} className="card-action" target={c.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
              {c.actionText} →
            </a>
          </div>
        ))}
      </div>

      {/* Main Form and Location Split Section */}
      <main className="contact-layout">
        {/* Inquiry Form */}
        <section className="form-card">
          <h2>Send a Quick Service Inquiry</h2>
          <p className="sub">Fill in the fields below and an engineer will connect with you.</p>

          {status.text && (
            <div className={`alert-box ${status.type}`}>
              <span>{status.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2col">
              <div className="field-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              <div className="field-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('mobile')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className="grid-2col">
              <div className="field-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com (optional)"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="field-group">
                <label>Your City / Locality *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Noida Sector 62 or Delhi"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Select Required Service *</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
              >
                <option value="AC Service & Gas Charging">AC Service & Gas Charging</option>
                <option value="AC Installation / Uninstallation">AC Installation / Uninstallation</option>
                <option value="Refrigerator Cooling & Compressor Fix">Refrigerator Cooling & Compressor Fix</option>
                <option value="Washing Machine Drum & Motor Repair">Washing Machine Drum & Motor Repair</option>
                <option value="Other Home Appliance Checkup">Other Home Appliance Checkup</option>
              </select>
            </div>

            <div className="field-group">
              <label>Describe the Issue *</label>
              <textarea
                name="message"
                required
                rows="4"
                placeholder="Mention appliance brand, symptoms (e.g. water leakage, loud sound, not cooling)..."
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting Details...' : 'Send Message'}
            </button>
          </form>
        </section>

        {/* Map & Operational Details */}
        <section className="info-card" id="service-map">
          <div className="map-wrapper">
            <iframe
              title="Service Hub Map"
              src="https://maps.google.com/maps?q=Noida%20Sector%2062&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
            />
          </div>

          <div className="hours-box">
            <h3>⏰ Working & Dispatch Hours</h3>
            <div className="hours-row">
              <span>Monday – Saturday</span>
              <span>8:00 AM – 9:00 PM</span>
            </div>
            <div className="hours-row">
              <span>Sunday (Emergency Calls)</span>
              <span>9:00 AM – 8:00 PM</span>
            </div>
            <div className="hours-row">
              <span>Average Technician Arrival</span>
              <span>Under 90 Minutes</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="contact-footer">
        <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
        <p>Doorstep AC, Refrigerator, and Washing Machine Repair Services in Delhi NCR.</p>
      </footer>
    </div>
  );
}