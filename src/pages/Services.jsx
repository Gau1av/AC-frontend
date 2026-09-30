import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Services.css';

export default function Services() {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('AC Deep Cleaning & Service');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    serviceType: '',
    date: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const serviceCategories = [
    {
      id: 'ac',
      category: 'Air Conditioner Services',
      tagline: 'Split & Window AC Complete Maintenance',
      description: 'High-precision cooling solutions using pressure-jet cleaning technology, eco-friendly refrigerants, and manufacturer-grade diagnostic equipment.',
      plans: [
        {
          title: 'AC Jet Deep Servicing',
          price: 'Starting from ₹499',
          features: [
            'High-pressure water jet cleaning for cooling coils',
            'Blower, indoor drain tray, and filter flushing',
            'Outdoor condenser unit deep cleaning',
            'Gas pressure & electrical amp inspection',
            'Airflow performance check & deodorization'
          ],
          popular: true
        },
        {
          title: 'AC Gas Refilling & Leak Fix',
          price: 'Starting from ₹2,499',
          features: [
            'Nitrogen pressure testing for pinhole leaks',
            'Brazing & copper tube leak repair',
            'Complete moisture vacuum evacuation',
            'Authentic R32, R410A, or R22 gas top-up by weight',
            'Compressor running current calibration'
          ],
          popular: false
        },
        {
          title: 'AC Installation / Uninstallation',
          price: 'Starting from ₹599',
          features: [
            'Precision level indoor bracket mounting',
            'Heavy-duty outdoor stand wall fixing',
            'Copper flare connection & electrical wiring',
            'Drainage slope alignment & vibration check',
            'Standard testing for vibration and cooling load'
          ],
          popular: false
        }
      ],
      issuesSolved: [
        'AC blowing warm or room-temperature air',
        'Water leakage from indoor unit onto the wall',
        'Foul or musty odor emerging from air vents',
        'Loud compressor vibration or screeching noises',
        'Frequent MCB tripping during operation'
      ]
    },
    {
      id: 'refrigerator',
      category: 'Refrigerator Repair & Maintenance',
      tagline: 'Single Door, Double Door & Side-by-Side Systems',
      description: 'Comprehensive cooling restoration for all domestic and commercial refrigerators, handling inverters, relays, compressors, and sealed system repairs.',
      plans: [
        {
          title: 'Routine Cooling Diagnostic',
          price: 'Starting from ₹299',
          features: [
            'Thermostat & temperature sensor check',
            'Defrost timer & bi-metal relay evaluation',
            'Door magnetic gasket seal test',
            'Condenser coil cleaning & dust purge',
            'Cabinet insulation and airflow balancing'
          ],
          popular: false
        },
        {
          title: 'Compressor & Gas Charging',
          price: 'Starting from ₹1,499',
          features: [
            'Inverter & non-inverter compressor replacement',
            'Filter drier replacement & capillary purging',
            'Complete system vacuum and dehydration',
            'Pure R600a / R134a refrigerant charging',
            'Starting capacitor & overload protector testing'
          ],
          popular: true
        },
        {
          title: 'Defrost & Circuit Board Repair',
          price: 'Starting from ₹699',
          features: [
            'Defrost heater coil & sensor replacement',
            'Microcontroller PCB board testing & repair',
            'Evaporator fan motor replacement',
            'Internal LED light and switch repairs',
            'Drainage hole de-icing and clearing'
          ],
          popular: false
        }
      ],
      issuesSolved: [
        'Freezer freezing while lower cabinet stays warm',
        'Continuous clicking sound behind the refrigerator',
        'Ice buildup blocking evaporator cooling coils',
        'Water pooling inside vegetable storage trays',
        'Cabinet exterior walls overheating excessively'
      ]
    },
    {
      id: 'washing',
      category: 'Washing Machine Repair',
      tagline: 'Front Load, Top Load & Semi-Automatic Units',
      description: 'Fast doorstep troubleshooting for direct drive and belt-driven washing machines across all major Indian and international appliance brands.',
      plans: [
        {
          title: 'Deep Drum Descaling & Service',
          price: 'Starting from ₹399',
          features: [
            'Chemical drum descaling treatment',
            'Inlet valve water filter screen flushing',
            'Coin trap & drain pump debris clearance',
            'Suspension rod and damper lubrication',
            'Belt tensioning & spin stability alignment'
          ],
          popular: false
        },
        {
          title: 'Drum Bearing & Motor Fix',
          price: 'Starting from ₹1,299',
          features: [
            'Tub bearing & water seal replacement',
            'Spider arm assembly renewal',
            'Drive motor capacitor & carbon brush testing',
            'Belt replacement & pulley balancing',
            'Extreme spin noise & wobble eradication'
          ],
          popular: true
        },
        {
          title: 'PCB, Drain & Water Inlet Repair',
          price: 'Starting from ₹599',
          features: [
            'Main logic control board component repair',
            'Water intake solenoid valve replacement',
            'Drain motor & drain valve mechanism renewal',
            'Pressure switch & water level sensor diagnosis',
            'Door interlock switch replacement'
          ],
          popular: false
        }
      ],
      issuesSolved: [
        'Machine not draining water or throwing error codes',
        'Excessive shaking and banging during spin cycles',
        'Drum not spinning while motor is humming',
        'Water leaking from underneath the machine',
        'Machine stops mid-cycle without washing'
      ]
    }
  ];

  const handleOpenModal = (serviceName) => {
    setSelectedService(serviceName);
    setFormData((prev) => ({ ...prev, serviceType: serviceName }));
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await axios.post('http://localhost:5000/api/inquiries', formData);
      if (res.data.success) {
        setStatus('Thank you! Your booking request has been submitted successfully.');
        setFormData({
          name: '',
          mobile: '',
          email: '',
          city: '',
          serviceType: selectedService,
          date: '',
          message: ''
        });
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = activeTab === 'all' 
    ? serviceCategories 
    : serviceCategories.filter(cat => cat.id === activeTab);

  return (
    <div className="services-page">
      {/* Header */}
      <header className="navbar">
        <div className="logo">
          <span>❄</span> Chintu Cool AC Service
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/services" className="active">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a className="call-btn" href="tel:+919354397318">📞 Call Now</a>
      </header>

      {/* Hero Banner */}
      <section className="services-hero">
        <p className="sub-badge">PROFESSIONAL APPLIANCE CARE</p>
        <h1>Our Specialized Repair & Maintenance Services</h1>
        <p>
          Genuine spare parts, upfront pricing, certified technicians, and a 30-day service warranty
          across Delhi, Noida, and NCR.
        </p>

        {/* Category Filters */}
        <div className="tab-filters">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            All Services
          </button>
          <button 
            className={activeTab === 'ac' ? 'active' : ''} 
            onClick={() => setActiveTab('ac')}
          >
            Air Conditioners
          </button>
          <button 
            className={activeTab === 'refrigerator' ? 'active' : ''} 
            onClick={() => setActiveTab('refrigerator')}
          >
            Refrigerators
          </button>
          <button 
            className={activeTab === 'washing' ? 'active' : ''} 
            onClick={() => setActiveTab('washing')}
          >
            Washing Machines
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="services-content-wrapper">
        {filteredCategories.map((category) => (
          <section key={category.id} className="category-block" id={category.id}>
            <div className="category-header">
              <h2>{category.category}</h2>
              <p className="category-tagline">{category.tagline}</p>
              <p className="category-desc">{category.description}</p>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
              {category.plans.map((plan, idx) => (
                <div key={idx} className={`plan-card ${plan.popular ? 'highlighted' : ''}`}>
                  {plan.popular && <span className="badge">Most Popular</span>}
                  <h3>{plan.title}</h3>
                  <div className="price-tag">{plan.price}</div>
                  <ul className="plan-checklist">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx}>
                        <span className="check-mark">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="book-service-btn" 
                    onClick={() => handleOpenModal(`${category.category} - ${plan.title}`)}
                  >
                    Book This Service
                  </button>
                </div>
              ))}
            </div>

            {/* Common Issues Section */}
            <div className="issues-box">
              <h4>⚠️ Common Issues We Resolve In {category.category}:</h4>
              <div className="issues-list">
                {category.issuesSolved.map((issue, iIdx) => (
                  <div key={iIdx} className="issue-chip">
                    <span>•</span> {issue}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* Service Assurance Guarantees */}
      <section className="service-guarantees">
        <h2>Why Thousands Trust Our Service</h2>
        <div className="guarantees-grid">
          <div className="guarantee-card">
            <div className="guarantee-icon">🛡️</div>
            <h3>30-Day Service Guarantee</h3>
            <p>Every repair visit comes with a comprehensive 30-day post-service warranty on our workmanship.</p>
          </div>
          <div className="guarantee-card">
            <div className="guarantee-icon">⏱️</div>
            <h3>120-Minute Express Arrival</h3>
            <p>Technicians available on short notice across major hubs in Delhi, Noida, and adjoining NCR regions.</p>
          </div>
          <div className="guarantee-card">
            <div className="guarantee-icon">🔧</div>
            <h3>100% Genuine Spare Parts</h3>
            <p>We source authentic OEM components from direct brand suppliers to ensure appliance durability.</p>
          </div>
          <div className="guarantee-card">
            <div className="guarantee-icon">💳</div>
            <h3>Transparent Flat Pricing</h3>
            <p>No unexpected hidden costs. Complete cost estimates are provided before starting any repair work.</p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>

            <form className="booking-form" onSubmit={handleSubmit}>
              <h3>Book Appliance Service</h3>
              <p className="modal-subheading">Selected: <strong>{selectedService}</strong></p>

              {status && <p className="alert">{status}</p>}

              <label>Your Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
              />

              <label>Phone Number *</label>
              <input
                type="tel"
                name="mobile"
                required
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleInputChange}
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com (optional)"
                value={formData.email}
                onChange={handleInputChange}
              />

              <label>Service Location / Address *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Sector / Area, City (e.g. Noida Sector 62)"
                value={formData.city}
                onChange={handleInputChange}
              />

              <label>Preferred Visit Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />

              <label>Appliance Brand / Issue Description *</label>
              <textarea
                name="message"
                required
                rows="3"
                placeholder="Mention brand (LG, Samsung, Daikin, etc.) and what problem you are facing..."
                value={formData.message}
                onChange={handleInputChange}
              />

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting Request...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Quick Float Button */}
      <a 
        href="https://wa.me/919354397318?text=Hello%20Chintu%20Cool%20Team,%20I%20am%20looking%20for%20doorstep%20appliance%20service." 
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
            <p>Reliable doorstep installation, cleaning, and repair solutions for all major household cooling and washing appliances.</p>
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
            <a href="tel:+919354397318" className="footer-action-link">📞 +91 93543 97318</a>
            <a href="tel:+918506994651" className="footer-action-link">📞 +91 85069 94651</a>
            <a href="mailto:gaurav25543@gmail.com" className="footer-action-link">✉️ gaurav25543@gmail.com</a>
          </div>

          <div className="footer-col">
            <h4>Service Areas</h4>
            <p>📍 Delhi</p>
            <p>📍 Noida & Greater Noida</p>
            <p>📍 Ghaziabad & Gurugram</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}