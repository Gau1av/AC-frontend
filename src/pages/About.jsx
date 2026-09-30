import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '8,500+', label: 'Appliances Repaired' },
    { number: '4.9/5', label: 'Customer Rating' },
    { number: '35+', label: 'Certified Technicians' }
  ];

  const coreValues = [
    {
      icon: '🎯',
      title: 'Accuracy in Diagnostics',
      description: 'We prioritize diagnosing the exact root cause of an appliance breakdown using digital multimeters, vacuum gauges, and OEM testing instruments rather than guess-work.'
    },
    {
      icon: '🛡️',
      title: 'Honest & Transparent Pricing',
      description: 'No hidden visit charges or forced part replacements. We inspect the appliance, present an upfront estimate, and proceed only upon your explicit approval.'
    },
    {
      icon: '⚙️',
      title: 'OEM-Grade Genuine Parts',
      description: 'Every replacement component—from AC capacitors and compressors to washing machine drive belts and fridge relays—is sourced directly from verified authorized distributors.'
    },
    {
      icon: '⏱️',
      title: 'Time-Bound Doorstep Service',
      description: 'We respect your schedule. Our field teams operate with optimized regional routes across Delhi, Noida, and Gurgaon to guarantee fast turnarounds.'
    }
  ];

  const brands = [
    'LG', 'Samsung', 'Daikin', 'Voltas', 'Whirlpool', 
    'Hitachi', 'Godrej', 'Panasonic', 'Haier', 'Bosch', 'IFB'
  ];

  const workSteps = [
    {
      step: '01',
      title: 'Instant Booking',
      desc: 'Schedule a visit online or connect with us directly via phone or WhatsApp.'
    },
    {
      step: '02',
      title: 'Doorstep Inspection',
      desc: 'A background-verified technician arrives with complete diagnostic tooling.'
    },
    {
      step: '03',
      title: 'Transparent Quote',
      desc: 'Receive an itemized quote detailing labor and required genuine spare parts.'
    },
    {
      step: '04',
      title: 'Repair & 30-Day Warranty',
      desc: 'Execution of testing and repair backed by a comprehensive 30-day service warranty.'
    }
  ];

  return (
    <div className="about-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <span>❄</span> Chintu Cool AC Service
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about" className="active">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a className="call-btn" href="tel:+919354397318">
          📞 Call Now
        </a>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <span className="about-badge">ABOUT CHINTU COOL APPLIANCE CARE</span>
        <h1>Delivering Dependable Comfort to Every Home in Delhi NCR</h1>
        <p>
          Founded on principles of technical integrity, speed, and customer-first service, 
          Chintu Cool has grown from a specialized cooling workshop into one of the most trusted 
          doorstep repair providers for Air Conditioners, Refrigerators, and Washing Machines.
        </p>
      </section>

      {/* Stats Counter Bar */}
      <section className="about-stats-container">
        <div className="about-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Story */}
      <section className="about-section container">
        <div className="about-story-grid">
          <div className="story-content">
            <span className="section-label">OUR JOURNEY & MISSION</span>
            <h2>Bridging the Gap Between Quality Engineering & Local Convenience</h2>
            <p>
              In extreme weather conditions, a broken air conditioner or a non-cooling refrigerator 
              is not a minor inconvenience—it disrupts your day-to-day life. Traditional appliance repairs 
              are often fraught with uncertified technicians, counterfeit components, and inflated bills.
            </p>
            <p>
              Chintu Cool was established to reform this experience. We built an in-house roster of factory-trained 
              technicians who understand electrical safety, thermal dynamics, and micro-controller circuit boards. 
              Our mission is straightforward: <strong>deliver factory-standard repairs right at your living room, on time, and at fair market prices.</strong>
            </p>
            <div className="mission-highlights">
              <div className="highlight-pill">✓ 100% Background-Verified Staff</div>
              <div className="highlight-pill">✓ Eco-Friendly Refrigerants Used</div>
              <div className="highlight-pill">✓ Digital Invoicing & Service History</div>
            </div>
          </div>
          <div className="story-badge-box">
            <div className="badge-inner">
              <div className="trophy-icon">🏆</div>
              <h3>Committed to Service Excellence</h3>
              <p>
                From split AC chemical washings to inverter compressor installations and washing machine 
                drum spindle rebuilding, we handle complex mechanical failures that others turn down.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="values-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">WHAT DEFINES US</span>
            <h2>Our Core Principles</h2>
            <p className="section-subtext">Every technician in our uniform adheres strictly to four golden operational standards.</p>
          </div>
          <div className="values-grid">
            {coreValues.map((val, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon">{val.icon}</div>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="workflow-section container">
        <div className="text-center">
          <span className="section-label">THE PROCESS</span>
          <h2>How We Serve You</h2>
          <p className="section-subtext">A smooth, predictable repair cycle from booking to warranty sign-off.</p>
        </div>
        <div className="workflow-grid">
          {workSteps.map((step, idx) => (
            <div key={idx} className="workflow-card">
              <span className="step-num">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-Brand Expertise */}
      <section className="brands-section">
        <div className="container text-center">
          <span className="section-label">BRANDS WE REPAIR</span>
          <h2>Certified Diagnostic Support for Major Brands</h2>
          <p className="section-subtext">Our repair specialists are equipped with schematic documentation and genuine spares for all top manufacturers.</p>
          <div className="brand-tags">
            {brands.map((b, idx) => (
              <span key={idx} className="brand-tag">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta container">
        <div className="cta-banner">
          <h2>Experiencing an Appliance Emergency?</h2>
          <p>Book a doorstep inspection today or chat with our senior service engineers for free technical guidance.</p>
          <div className="cta-actions">
            <a href="tel:+919354397318" className="cta-primary-btn">📞 Call +91 93543 97318</a>
            <Link to="/services" className="cta-secondary-btn">Explore All Services</Link>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919354397318?text=Hello%20Chintu%20Cool%20Team,%20I%20want%20to%20know%20more%20about%20your%20services." 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        💬 WhatsApp
      </a>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid container">
          <div className="footer-col">
            <div className="logo">
              <span>❄</span> Chintu Cool AC Service
            </div>
            <p>Your dependable neighborhood technician network for air conditioning, cooling refrigeration, and home laundry systems.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Direct Contacts</h4>
            <a href="tel:+919354397318">📞 +91 93543 97318</a>
            <a href="tel:+918506994651">📞 +91 85069 94651</a>
            <a href="mailto:gaurav25543@gmail.com">✉️ gaurav25543@gmail.com</a>
          </div>

          <div className="footer-col">
            <h4>Operational Headquarters</h4>
            <p>📍 Sector 62 & 18, Noida</p>
            <p>📍 South & East Delhi Hubs</p>
            <p>📍 Gurugram & Ghaziabad</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}