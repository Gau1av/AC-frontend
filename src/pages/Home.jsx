import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API, { getImageUrl } from "../api";
import "./Home.css";

// Banner images
import banner1 from "../assets/2.jpeg";
import banner2 from "../assets/3.jpeg";
import banner3 from "../assets/4.jpeg";
import banner4 from "../assets/5.jpeg";
import banner5 from "../assets/6.jpeg";
import banner6 from "../assets/7.jpeg";
import banner7 from "../assets/8.jpeg";
import logo from "../assets/logo.jpeg";

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
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    state: "",
    city: "",
    serviceType: "AC Services",
    date: getTodayDate(),
    message: ""
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 📰 Blogs State
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  // Slider banner state
  const bannerImages = [banner1, banner2, banner3, banner4, banner5, banner6, banner7];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [bannerImages.length]);

  // 🔄 Fetch published blogs for Home page
  useEffect(() => {
    const fetchHomeBlogs = async () => {
      try {
        setBlogsLoading(true);
        const res = await API.get("/api/blogs?status=Published");
        const allBlogs = res.data.data || res.data || [];
        const published = allBlogs
          .filter((b) => !b.status || b.status === "Published")
          .slice(0, 3);
        setLatestBlogs(published);
      } catch (err) {
        try {
          const fallbackRes = await API.get("/api/admin/blogs");
          const blogsData = fallbackRes.data.data || [];
          const published = blogsData
            .filter((b) => b.status === "Published")
            .slice(0, 3);
          setLatestBlogs(published);
        } catch (innerErr) {
          console.error("Home blog fetch error:", innerErr);
        }
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchHomeBlogs();
  }, []);

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
      icon: "🔄",
      title: "Motor Repair & Rewinding",
      description: "Water pump, cooler motor, and submersible motor inspection, winding & repair."
    },
    {
      icon: "🪭",
      title: "Fan Repair & Installation",
      description: "Ceiling fan, exhaust fan, table fan capacitor replacement, noise fix & fitting."
    },
    {
      icon: "⚡",
      title: "House Wiring",
      description: "New house electrical piping, full wiring, short circuit diagnosis & MCB board setup."
    },
    {
      icon: "🛠️",
      title: "All Electric Works",
      description: "Switchboard fitting, inverter-battery wiring, lights, earthing & general electric repairs."
    },
    {
      icon: "⚙️",
      title: "Preventive Maintenance",
      description: "Routine checkups and servicing for optimal cooling, power efficiency, and long appliance life."
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
          <img src={logo} alt="Chintu AC Cool Care" className="logo-img" />
          <span className="logo-text">Chintu Cool AC Service</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/admin/dashboard" className="admin-link">Admin Portal</Link>
        </nav>
        <a className="call-btn" href="tel:+919354397318">
          📞 Call Now
        </a>
      </header>

      {/* Promotional Strip */}
      <div className="promo-banner">
        <div className="promo-content">
          <span>🔥 Special Offer!</span> Up to 20% OFF on AC Cleaning, Motors, House Wiring & Appliance Repairs.
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
          <p className="tagline">EXPERT APPLIANCE & ELECTRICAL CARE</p>
          <h1>Reliable Doorstep Appliance & Electric Repair</h1>
          <p>
            AC, Refrigerator, Washing Machine, Motors, Fans, and Complete House Wiring by Certified Technicians with genuine spare parts and fast diagnosis.
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
              <small>Services Completed</small>
            </div>
            <div>
              <strong>4.9 ★</strong>
              <small>Customer Rating</small>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="ac-circle">⚡</div>
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
          <h2>Complete Home Appliance & Electrical Solutions</h2>
          <p>
            From AC and Fridge maintenance to water motors, ceiling fans, and full house electrical wiring.
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
            Our certified electricians and appliance technicians deliver safe, long-lasting fixes with clear upfront pricing.
          </p>

          <div className="features">
            <div>
              <span>✓</span>
              <div>
                <strong>Experienced Technicians</strong>
                <p>Specialists in all major appliance brands, heavy motors, and modern home wiring.</p>
              </div>
            </div>

            <div>
              <span>✓</span>
              <div>
                <strong>Transparent Pricing</strong>
                <p>No hidden charges, standard rate cards, and authentic spare parts.</p>
              </div>
            </div>

            <div>
              <span>✓</span>
              <div>
                <strong>Quick Doorstep Service</strong>
                <p>Fast appointment scheduling with same-day emergency visit options.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📝 BLOGS SECTION ON HOME PAGE */}
      <section className="home-blogs-section">
        <div className="section-heading">
          <p className="tagline">EXPERT TIPS & GUIDES</p>
          <h2>Latest from Our Blog</h2>
          <p>Maintenance advice, electrical safety tips, and energy-saving guides from our repair specialists.</p>
        </div>

        {blogsLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading latest blogs...
          </div>
        ) : latestBlogs.length > 0 ? (
          <div className="home-blog-grid">
            {latestBlogs.map((blog) => (
              <article key={blog._id} className="home-blog-card">
                <div className="home-blog-image-wrap">
                  {blog.imageUrl ? (
                    <img
                      src={getImageUrl ? getImageUrl(blog.imageUrl) : blog.imageUrl}
                      alt={blog.title}
                      className="home-blog-img"
                    />
                  ) : (
                    <div className="home-blog-placeholder">❄️ Appliance Guide</div>
                  )}
                  <span className="home-blog-badge">{blog.category || "AC Repair"}</span>
                </div>

                <div className="home-blog-content">
                  <div className="home-blog-meta">
                    <span>👤 {blog.author || "Expert Tech"}</span>
                    <span>•</span>
                    <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="home-blog-title">{blog.title}</h3>

                  <p className="home-blog-excerpt">
                    {blog.excerpt || (blog.content ? blog.content.substring(0, 100) + "..." : "")}
                  </p>

                  <Link
                    to={`/blog/${blog.slug || blog._id}`}
                    className="home-blog-read-btn"
                  >
                    Read Full Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
            No published blogs available right now. Check back soon!
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link to="/blog" className="home-blog-view-all">
            View All Articles & Guides →
          </Link>
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

              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
              />

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

              <label>Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
              />

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

              <label>City / Location *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Enter city / area (e.g. Noida, Delhi, Patna)"
                value={formData.city}
                onChange={handleInputChange}
              />

              <label>Select Service *</label>
              <select
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={handleInputChange}
              >
                <option value="AC Services">AC Services (Installation / Repair / Gas Charging)</option>
                <option value="Refrigerator Repair">Refrigerator Repair (Single / Double Door / Deep Freeze)</option>
                <option value="Washing Machine Repair">Washing Machine Repair (Automatic / Semi-Automatic)</option>
                <option value="Motor Repair & Rewinding">Motor (Water Pump / Cooler Motor / Submersible)</option>
                <option value="Fan Repair & Installation">Fan (Ceiling Fan / Exhaust / Table Fan)</option>
                <option value="House Wiring">House Wiring (New Wiring / Short Circuit / MCB)</option>
                <option value="All Electric Works">All Electric Works (Switchboard, Inverter, Earthing, Lights)</option>
                <option value="Preventive Maintenance">Preventive Maintenance & Inspection</option>
                <option value="Other">Other Home Appliances</option>
              </select>

              <label>Preferred Service Date *</label>
              <input
                type="date"
                name="date"
                required
                min={getTodayDate()}
                value={formData.date}
                onChange={handleInputChange}
              />

              <label>Message / Appliance Issue *</label>
              <textarea
                name="message"
                required
                placeholder="Describe the issue (e.g., motor sound, fan capacitor slow, wiring fault, AC cooling)..."
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

      {/* Floating Official WhatsApp Action Button */}
      <a
        href="https://wa.me/919354397318?text=Hello,%20mujhe%20service%20inquiry%20karni%20hai"
        className="whatsapp-float-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        style={{
          position: "fixed",
          bottom: "26px",
          right: "26px",
          backgroundColor: "#25D366",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(37, 211, 102, 0.45)",
          zIndex: 9999,
          textDecoration: "none",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 211, 102, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(37, 211, 102, 0.45)";
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="34"
          height="34"
          fill="#ffffff"
          style={{ display: "block" }}
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.26 2.14 7.42L2.05 29.5a1 1 0 0 0 1.25 1.24l6.3-1.99A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.54a11.53 11.53 0 0 1-5.86-1.61 1 1 0 0 0-.69-.14l-4.5 1.42 1.48-4.32a1 1 0 0 0-.13-.74A11.55 11.55 0 1 1 16 27.54zm6.75-8.49c-.37-.18-2.18-1.07-2.52-1.2-.34-.12-.58-.18-.83.18-.24.37-.95 1.2-1.16 1.45-.22.24-.43.27-.8.09-.37-.18-1.56-.58-2.97-1.84-1.1-1-1.84-2.22-2.06-2.59-.22-.37-.02-.57.16-.75.17-.17.37-.43.55-.65.18-.22.25-.37.37-.62.12-.24.06-.46-.03-.64-.09-.18-.83-2-.1.14-2.74-.3-.72-.61-.62-.83-.63h-.71c-.24 0-.64.09-.98.46-.34.37-1.3 1.27-1.3 3.1 0 1.83 1.33 3.6 1.52 3.84.18.25 2.62 4 6.35 5.61.89.38 1.58.61 2.12.78.89.28 1.7.24 2.34.15.71-.11 2.18-.89 2.49-1.75.31-.86.31-1.6.22-1.75-.09-.16-.34-.25-.71-.43z" />
        </svg>
      </a>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid container">
          <div className="footer-col">
            <div className="logo">
              <img src={logo} alt="Chintu AC Cool Care" className="logo-img" />
              <span className="logo-text">Chintu Cool AC Service</span>
            </div>
            <p>Doorstep AC, Refrigerator, Washing Machine, Motor, Fan & Complete Electrical Repair Solutions.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/blog">Blog</Link>
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
            <p>📍 Noida & Faridabad</p>
            <p>📍 Ghaziabad & Gurugram(Haryana)</p>
            <p>📍 All Over INDIA</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
          <p>Doorstep AC Installation, Gas Refilling, Fridge Motor, Washing Machine Drum, Fan & House Wiring Fix.</p>
        </div>
      </footer>
    </div>
  );
}