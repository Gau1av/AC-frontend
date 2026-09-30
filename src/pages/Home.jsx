import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./Home.css";

// Banner images
import banner1 from "../assets/2.jpeg";
import banner2 from "../assets/3.jpeg";
import banner3 from "../assets/WhatsApp Image 2026-09-05 at 15.45.15.jpeg";

// 29 States & UT fixed list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi (NCT)"
];

export default function Home() {
  // Aaj ki date auto-select karne ke liye
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    state: "",
    city: "",
    serviceType: "AC Services",
    date: getTodayDate(), // Aaj ki auto date
    message: ""
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Slider banner state
  const bannerImages = [banner1, banner2, banner3];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [bannerImages.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const services = [
    {
      icon: "❄️",
      title: "AC Services",
      description: "Installation, deep cleaning, piping, and fast repair for split & window ACs."
    },
    {
      icon: "🧊",
      title: "Refrigerator Repair",
      description: "Single, double door & side-by-side fridge cooling, compressor & gas leak fixes."
    },
    {
      icon: "🧺",
      title: "Washing Machine Repair",
      description: "Comprehensive repair for front-load, top-load, and semi-automatic washing machines."
    },
    {
      icon: "⚙️",
      title: "Preventive Maintenance",
      description: "Regular checkups and routine servicing for optimal cooling and long appliance life."
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenModalWithService = (serviceTitle = "AC Services") => {
    setFormData((prev) => ({
      ...prev,
      serviceType: serviceTitle,
      date: prev.date || getTodayDate()
    }));
    setStatus("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await API.post("/api/inquiries", formData);
      if (res.data.success) {
        setStatus(res.data.message || "Booking request confirmed successfully!");
        setFormData({
          name: "",
          mobile: "",
          email: "",
          state: "",
          city: "",
          serviceType: "AC Services",
          date: getTodayDate(),
          message: ""
        });
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Inquiry submit karne me problem aayi. Kripya dobara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="logo">
          <span>❄</span> Chintu Cool AC Service
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin/dashboard" className="admin-link">Admin Portal</Link>
        </nav>
        <a className="call-btn" href="tel:+919354397318">
          📞 Call Now
        </a>
      </header>

      {/* Promotional Strip */}
      <div className="promo-banner">
        <div className="promo-content">
          <span>🔥 Special Offer!</span> Up to 20% OFF on AC Deep Cleaning, Refrigerator & Washing Machine Repairs.
        </div>
        <button onClick={() => handleOpenModalWithService()} className="promo-btn">
          Claim Offer
        </button>
      </div>

      {/* Image Slider */}
      <section className="banner-slider-container">
        <div className="banner-slider">
          {bannerImages.map((img, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? "active" : ""}`}
            >
              <img src={img} alt={`Appliance Service Banner ${index + 1}`} />
            </div>
          ))}
        </div>

        <button className="slider-btn prev-btn" onClick={handlePrevSlide}>❮</button>
        <button className="slider-btn next-btn" onClick={handleNextSlide}>❯</button>

        <div className="slider-dots">
          {bannerImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="tagline">EXPERT APPLIANCE CARE</p>
          <h1>Reliable Doorstep Appliance Repair</h1>
          <p>
            AC, Refrigerator & Washing Machine Service by Certified Technicians with doorstep installation,
            fast diagnosis, and authentic spare parts.
          </p>

          <div className="hero-buttons">
            <button onClick={() => handleOpenModalWithService()} className="primary-btn">
              Book a Service
            </button>
            <a href="#services" className="secondary-btn">
              View Services
            </a>
          </div>

          <div className="trust">
            <div>
              <strong>10+</strong>
              <small>Years Experience</small>
            </div>
            <div>
              <strong>8,000+</strong>
              <small>Appliances Serviced</small>
            </div>
            <div>
              <strong>4.9 ★</strong>
              <small>Customer Rating</small>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="ac-circle">❄️</div>
          <h3>Express Care</h3>
          <p>Fast • Reliable • Affordable</p>
          <a
            href="https://wa.me/919354397318?text=Hello,%20mujhe%20urgent%20repair%20service%20chahiye"
            target="_blank"
            rel="noreferrer"
            className="hero-wa-btn"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="services" id="services">
        <div className="section-heading">
          <p className="tagline">OUR SERVICES</p>
          <h2>Complete Home Appliance Care</h2>
          <p>
            Everything you need to keep your AC, Refrigerator, and Washing Machine running smoothly.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button
                onClick={() => handleOpenModalWithService(service.title)}
                className="service-book-btn"
              >
                Book Now →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About & Why Choose Us Section */}
      <section className="about" id="about">
        <div className="about-image">
          <div className="technician">👨‍🔧</div>
        </div>

        <div className="about-content">
          <p className="tagline">WHY CHOOSE US</p>
          <h2>Professional Service You Can Trust</h2>
          <p>
            Our trained technicians provide reliable repairs and maintenance with high quality
            workmanship and clear pricing.
          </p>

          <div className="features">
            <div>
              <span>✓</span>
              <div>
                <strong>Experienced Technicians</strong>
                <p>Skilled professionals for all major appliance brands.</p>
              </div>
            </div>

            <div>
              <span>✓</span>
              <div>
                <strong>Transparent Pricing</strong>
                <p>No hidden charges or unnecessary part replacements.</p>
              </div>
            </div>

            <div>
              <span>✓</span>
              <div>
                <strong>Quick Doorstep Service</strong>
                <p>Fast appointment schedules directly at your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Popup Booking Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>

            <form className="booking-form modal-form" onSubmit={handleSubmit}>
              <h3>Schedule Doorstep Service</h3>
              <p className="modal-subheading">Fill in your details and our technician will contact you shortly</p>

              {status && <p className="alert">{status}</p>}

              {/* 1. Name */}
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
              />

              {/* 2. Mobile */}
              <label>Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                required
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleInputChange}
              />

              {/* 3. Email (Optional) */}
              <label>Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
              />

              {/* 4. State (Fixed Dropdown) */}
              <label>State *</label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* 5. City (User can type freely) */}
              <label>City / Location *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Enter city / area (e.g. Noida, Delhi, Lucknow)"
                value={formData.city}
                onChange={handleInputChange}
              />

              {/* 6. Service Type */}
              <label>Select Service *</label>
              <select
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={handleInputChange}
              >
                <option value="AC Services">AC Services (Installation / Repair / Gas)</option>
                <option value="Refrigerator Repair">Refrigerator Repair</option>
                <option value="Washing Machine Repair">Washing Machine Repair</option>
                <option value="Preventive Maintenance">Preventive Maintenance</option>
                <option value="Other">Other Home Appliances</option>
              </select>

              {/* 7. Service Date (Service Type ke theek baad) */}
              <label>Preferred Service Date *</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
              />

              {/* 8. Message */}
              <label>Message / Appliance Issue *</label>
              <textarea
                name="message"
                required
                placeholder="Describe the issue or exact location landmark..."
                value={formData.message}
                onChange={handleInputChange}
                rows="3"
              />

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Book Service Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/919354397318?text=Hello,%20mujhe%20service%20inquiry%20karni%20hai"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        💬 WhatsApp Chat
      </a>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid container">
          <div className="footer-col">
            <div className="logo">
              <span>❄</span> Chintu Cool AC Service
            </div>
            <p>Doorstep AC, Refrigerator, and Washing Machine Repair & Servicing Solutions.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Get in Touch</h4>
            <a href="tel:+919354397318" className="footer-action-link">📞 Call: +91 93543 97318</a>
            <a href="tel:+918506994651" className="footer-action-link">📞 Call: +91 85069 94651</a>
            <a href="mailto:gaurav25543@gmail.com" className="footer-action-link">✉️ Email: gaurav25543@gmail.com</a>
            <a
              href="https://wa.me/919354397318?text=Hi%20Sharma%20Service,%20I%20want%20to%20book%20a%20service"
              target="_blank"
              rel="noreferrer"
              className="footer-action-link"
            >
              💬 WhatsApp Us
            </a>
          </div>

          <div className="footer-col">
            <h4>Service Areas</h4>
            <p>📍 Delhi</p>
            <p>📍 Noida</p>
            <p>📍 All over India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
          <p>Doorstep AC Installation, Gas Refilling, Fridge Motor & Washing Machine Drum Fix.</p>
        </div>
      </footer>
    </div>
  );
}