import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import logo from '../assets/logo.jpeg' // ✅ NEW: Logo import

export default function Contact() {
  const initialFormData = {
    name: '',
    mobile: '',
    email: '',
    city: '',
    serviceType: 'AC Service & Gas Charging',
    message: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [hoursSlide, setHoursSlide] = useState(0);

  const sliderRef = useRef(null);

  const contactCards = [
    {
      icon: '📞',
      title: 'Call Us Directly',
      details: ['+91 93543 97318', '+91 85069 94651'],
      actionText: 'Dial Now',
      link: 'tel:+919354397318',
      gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      accent: '#3b82f6',
    },
    {
      icon: '💬',
      title: 'WhatsApp Support',
      details: ['Instant replies within 10 mins', 'Available 8 AM – 10 PM'],
      actionText: 'Chat on WhatsApp',
      link: 'https://wa.me/919354397318?text=Hello%20Chintu%20Cool%2C%20I%20need%20doorstep%20repair%20service.',
      gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
      accent: '#22c55e',
    },
    {
      icon: '✉️',
      title: 'Official Email',
      details: ['gaurav25543@gmail.com', 'support@chintucool.com'],
      actionText: 'Send Email',
      link: 'mailto:gaurav25543@gmail.com',
      gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      accent: '#f59e0b',
    },
    {
      icon: '📍',
      title: 'Service Hubs',
      details: ['Noida Sector 62 & 18', 'Delhi, Gurgaon & NCR'],
      actionText: 'View Areas',
      link: '#service-map',
      gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      accent: '#ec4899',
    },
  ];

  const hoursSlides = [
    {
      icon: '📅',
      title: 'Weekly Schedule',
      subtitle: 'Customer service hours',
      accent: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      rows: [
        { label: 'Monday – Friday', value: '8 AM – 9 PM' },
        { label: 'Saturday', value: '8 AM – 9 PM' },
        { label: 'Sunday', value: '9 AM – 8 PM', emergency: true },
      ],
    },
    {
      icon: '🚚',
      title: 'Dispatch Details',
      subtitle: 'Technician availability',
      accent: '#14b8a6',
      gradient: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
      rows: [
        { label: 'Average Arrival', value: '90 Minutes' },
        { label: 'Dispatch Service', value: '24 × 7' },
        { label: 'Phone Support', value: '8 AM – 10 PM' },
      ],
    },
  ];

  const scrollToSlide = (index) => {
    const container = sliderRef.current;
    if (!container) return;

    const slides = container.children;
    if (!slides.length) return;

    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    const targetSlide = slides[safeIndex];

    container.scrollTo({
      left: targetSlide.offsetLeft - slides[0].offsetLeft,
      behavior: 'smooth',
    });

    setHoursSlide(safeIndex);
  };

  const handlePrevSlide = () => {
    const newIndex = hoursSlide === 0 ? hoursSlides.length - 1 : hoursSlide - 1;
    scrollToSlide(newIndex);
  };

  const handleNextSlide = () => {
    const newIndex = (hoursSlide + 1) % hoursSlides.length;
    scrollToSlide(newIndex);
  };

  const handleSlideScroll = () => {
    const container = sliderRef.current;
    if (!container || !container.children.length) return;

    const slides = Array.from(container.children);
    const currentPosition = container.scrollLeft;

    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const slidePosition = slide.offsetLeft - slides[0].offsetLeft;
      const distance = Math.abs(slidePosition - currentPosition);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setHoursSlide(closestIndex);
  };

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const handleResize = () => {
      const slides = container.children;
      if (!slides.length) return;

      const index = Math.min(hoursSlide, slides.length - 1);

      container.scrollTo({
        left: slides[index].offsetLeft - slides[0].offsetLeft,
        behavior: 'auto',
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hoursSlide]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await API.post('/api/inquiries', formData);

      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data?.success !== false
      ) {
        setStatus({
          type: 'success',
          text: 'Thank you! Your inquiry has been received. Our technician will contact you shortly.',
        });

        setFormData(initialFormData);
      } else {
        setStatus({
          type: 'error',
          text: response.data?.message || 'Unable to submit your inquiry. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        text:
          error.response?.data?.message ||
          'Failed to submit inquiry. Please call us directly.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-root">
      <style>{`
        :root {
          --primary: #0284c7;
          --primary-dark: #0369a1;
          --secondary: #0f172a;
          --purple: #8b5cf6;
          --pink: #ec4899;
          --orange: #f97316;
          --yellow: #facc15;
          --green: #22c55e;
          --teal: #14b8a6;
          --rose: #f43f5e;
          --indigo: #6366f1;
          --blue: #3b82f6;

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

          --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.05);
          --shadow-md: 0 12px 30px rgba(15, 23, 42, 0.10);

          --radius: 16px;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .contact-root,
        .contact-root * {
          box-sizing: border-box;
        }

        .contact-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text-main);
          background:
            radial-gradient(circle at 5% 0%, rgba(139, 92, 246, 0.07), transparent 30%),
            radial-gradient(circle at 95% 30%, rgba(236, 72, 153, 0.06), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(20, 184, 166, 0.06), transparent 30%),
            var(--bg-canvas);
          min-height: 100vh;
          overflow-x: clip;
        }

        .contact-root a {
          -webkit-tap-highlight-color: transparent;
        }

        /* ==========================================
           NAVBAR — Rainbow border + Circular Logo
           ========================================== */
        .contact-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding: 17px 6%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 3px solid transparent;
          border-image: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316, #facc15, #22c55e, #14b8a6, #0284c7) 1;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.08);
        }

        /* ✅ NEW: Logo wrapper with image + text */
        .contact-logo {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          font-size: 1.15rem;
          font-weight: 850;
          white-space: nowrap;
          text-decoration: none;
          color: var(--secondary);
        }

        .contact-logo-img {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          object-position: center;
          border-radius: 50%;
          display: block;
          flex-shrink: 0;
          background: #ffffff;
          border: 2px solid rgba(139, 92, 246, 0.28);
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.2);
          transition: all 0.3s ease;
        }

        .contact-logo:hover .contact-logo-img {
          transform: rotate(-6deg) scale(1.06);
          border-color: #8b5cf6;
          box-shadow: 0 8px 22px rgba(139, 92, 246, 0.35);
        }

        .contact-logo-text {
          background: linear-gradient(90deg, #0284c7, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 850;
          white-space: nowrap;
        }

        .contact-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        .contact-nav a {
          color: var(--text-main);
          font-size: 0.94rem;
          font-weight: 650;
          text-decoration: none;
          transition: var(--transition);
          position: relative;
          padding: 4px 2px;
        }

        .contact-nav a::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .contact-nav a:hover,
        .contact-nav a.active {
          color: var(--purple);
        }

        .contact-nav a:hover::after,
        .contact-nav a.active::after {
          transform: scaleX(1);
        }

        .contact-call-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 16px;
          border: 1px solid #86efac;
          border-radius: 10px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #047857;
          font-weight: 750;
          font-size: 0.9rem;
          text-decoration: none;
          white-space: nowrap;
          transition: var(--transition);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }

        .contact-call-btn:hover {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.35);
        }

        /* ==========================================
           HERO HEADER — MULTICOLOR
           ========================================== */
        .contact-header {
          text-align: center;
          padding: 75px 20px 70px;
          background:
            radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.18), transparent 35%),
            radial-gradient(circle at 90% 70%, rgba(236, 72, 153, 0.15), transparent 35%),
            radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.18), transparent 40%),
            radial-gradient(circle at 20% 90%, rgba(250, 204, 21, 0.14), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.14), transparent 35%),
            linear-gradient(135deg, #e0f2fe 0%, #ede9fe 40%, #fce7f3 70%, #fef3c7 100%);
          position: relative;
          overflow: hidden;
        }

        .contact-header::before {
          content: "";
          position: absolute;
          top: -80px;
          left: -80px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.18), transparent 70%);
          pointer-events: none;
        }

        .contact-header::after {
          content: "";
          position: absolute;
          bottom: -100px;
          right: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.14), transparent 70%);
          pointer-events: none;
        }

        .header-badge {
          display: inline-block;
          padding: 8px 15px;
          margin-bottom: 18px;
          border: 1.5px solid transparent;
          border-radius: 50px;
          background:
            linear-gradient(white, white) padding-box,
            linear-gradient(90deg, #8b5cf6, #ec4899, #f97316) border-box;
          color: var(--purple);
          font-size: 0.77rem;
          font-weight: 850;
          letter-spacing: 1.5px;
          position: relative;
          z-index: 1;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.15);
        }

        .contact-header h1 {
          max-width: 850px;
          margin: 0 auto 17px;
          color: var(--secondary);
          font-size: clamp(2rem, 4vw, 3.15rem);
          font-weight: 900;
          letter-spacing: -1.2px;
          line-height: 1.15;
          position: relative;
          z-index: 1;
        }

        .contact-header h1::after {
          content: "";
          display: block;
          width: 80px;
          height: 4px;
          margin: 18px auto 0;
          border-radius: 4px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316, #facc15);
        }

        .contact-header p {
          max-width: 700px;
          margin: 0 auto;
          color: var(--text-muted);
          font-size: 1.04rem;
          line-height: 1.8;
          position: relative;
          z-index: 1;
        }

        /* ==========================================
           CONTACT CARDS
           ========================================== */
        .cards-container {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          max-width: 1240px;
          margin: -25px auto 65px;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .contact-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          padding: 25px 22px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: white;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .contact-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .contact-card:hover::before {
          transform: scaleX(1);
        }

        .contact-card:hover {
          transform: translateY(-6px);
          border-color: #c4b5fd;
          box-shadow: 0 16px 40px rgba(139, 92, 246, 0.18);
        }

        .card-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin-bottom: 17px;
          border-radius: 14px;
          font-size: 1.8rem;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
          transition: var(--transition);
        }

        .contact-card:hover .card-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .contact-card h3 {
          margin: 0 0 12px;
          color: var(--secondary);
          font-size: 1.06rem;
          font-weight: 800;
        }

        .card-detail {
          margin: 0 0 7px;
          color: var(--text-muted);
          font-size: 0.87rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .card-action {
          margin-top: auto;
          padding-top: 20px;
          font-size: 0.9rem;
          font-weight: 800;
          text-decoration: none;
          transition: var(--transition);
          display: inline-block;
        }

        .card-action:hover {
          transform: translateX(4px);
          text-decoration: underline;
        }

        /* ==========================================
           MAIN LAYOUT
           ========================================== */
        .contact-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          align-items: start;
          gap: 30px;
          max-width: 1240px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }

        .form-card {
          min-width: 0;
          padding: 34px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: white;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .form-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, #0284c7, #8b5cf6, #ec4899, #f97316, #22c55e);
        }

        .form-card h2 {
          margin: 0 0 10px;
          color: var(--secondary);
          font-size: clamp(1.5rem, 2.5vw, 1.9rem);
          font-weight: 850;
          line-height: 1.3;
          text-align: left;
        }

        .form-card .sub {
          margin: 0 0 26px;
          color: var(--text-muted);
          font-size: 0.94rem;
          line-height: 1.7;
          text-align: left;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          margin-bottom: 19px;
          width: 100%;
          text-align: left;
        }

        .field-group label {
          margin-bottom: 8px;
          color: var(--secondary);
          font-size: 0.88rem;
          font-weight: 750;
          text-align: left;
          align-self: flex-start;
          width: 100%;
          display: block;
        }

        .form-card input,
        .form-card select,
        .form-card textarea {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: var(--secondary);
          font: inherit;
          font-size: 0.92rem;
          transition: var(--transition);
          text-align: left;
          box-sizing: border-box;
          align-self: stretch;
        }

        .form-card input::placeholder,
        .form-card textarea::placeholder {
          color: #94a3b8;
          text-align: left;
        }

        .form-card input:hover,
        .form-card select:hover,
        .form-card textarea:hover {
          border-color: #a5b4fc;
        }

        .form-card input:focus,
        .form-card select:focus,
        .form-card textarea:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.14);
        }

        .form-card textarea {
          min-height: 125px;
          resize: vertical;
          line-height: 1.6;
        }

        .grid-2col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .submit-btn {
          display: block;
          width: 100%;
          padding: 15px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #0284c7, #8b5cf6 50%, #ec4899);
          background-size: 200% 100%;
          color: #fff;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(139, 92, 246, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background-position: 100% 0;
          box-shadow: 0 12px 30px rgba(236, 72, 153, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .alert-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 22px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .alert-box.success {
          border: 1px solid var(--success-border);
          background: var(--success-bg);
          color: var(--success-text);
        }

        .alert-box.error {
          border: 1px solid var(--error-border);
          background: var(--error-bg);
          color: var(--error-text);
        }

        /* ==========================================
           MAP & INFO CARD
           ========================================== */
        .info-card {
          display: flex;
          flex-direction: column;
          gap: 23px;
          min-width: 0;
        }

        .map-wrapper {
          height: 310px;
          overflow: hidden;
          border: 2px solid transparent;
          border-radius: 16px;
          background: #e2e8f0;
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .map-wrapper::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #14b8a6, #0284c7, #8b5cf6);
          z-index: 2;
        }

        .map-wrapper iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* ==========================================
           WORKING HOURS SLIDER
           ========================================== */
        .hours-box {
          position: relative;
          width: 100%;
          min-width: 0;
          padding: 21px;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 16px;
          background:
            radial-gradient(circle at 95% 5%, rgba(139, 92, 246, 0.06), transparent 40%),
            radial-gradient(circle at 5% 95%, rgba(236, 72, 153, 0.06), transparent 40%),
            white;
          box-shadow: var(--shadow-sm);
        }

        .hours-box::before {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316, #facc15, #22c55e, #14b8a6);
          content: "";
        }

        .hours-box-title {
          margin: 0 0 17px;
          padding-bottom: 13px;
          border-bottom: 1px dashed var(--border);
          color: var(--secondary);
          font-size: 1.02rem;
          font-weight: 850;
          line-height: 1.5;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .hours-slider {
          display: flex;
          width: 100%;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }

        .hours-slider::-webkit-scrollbar {
          display: none;
        }

        .hours-slide {
          flex: 0 0 100%;
          width: 100%;
          min-width: 0;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        .hours-slide-inner {
          display: flex;
          flex-direction: column;
          gap: 13px;
          min-width: 0;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .hours-slide-header {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding-bottom: 13px;
          border-bottom: 1px dashed #cbd5e1;
        }

        .hours-slide-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          font-size: 1.25rem;
        }

        .hours-slide-heading {
          min-width: 0;
        }

        .hours-slide-title {
          margin: 0 0 4px;
          color: var(--secondary);
          font-size: 0.95rem;
          font-weight: 850;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .hours-slide-sub {
          color: var(--text-muted);
          font-size: 0.76rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .hours-rows {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .hours-row-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #fff;
          transition: var(--transition);
        }

        .hours-row-item:hover {
          border-color: #c4b5fd;
          background: linear-gradient(135deg, #faf5ff, #f5f3ff);
          transform: translateX(3px);
        }

        .hours-row-item.emergency {
          border-color: #fcd34d;
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
        }

        .hours-row-item.emergency:hover {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .hours-row-label {
          flex: 1 1 auto;
          min-width: 0;
          color: var(--text-main);
          font-size: 0.82rem;
          font-weight: 650;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .hours-row-value {
          flex: 0 0 auto;
          max-width: 60%;
          color: var(--purple);
          font-size: 0.82rem;
          font-weight: 850;
          line-height: 1.45;
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .hours-row-item.emergency .hours-row-label {
          color: #9a3412;
        }

        .hours-row-item.emergency .hours-row-value {
          color: #b45309;
        }

        /* ==========================================
           SLIDER CONTROLS
           ========================================== */
        .hours-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px dashed var(--border);
        }

        .hours-nav-btn {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid #c4b5fd;
          border-radius: 50%;
          background: white;
          color: var(--purple);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 900;
          cursor: pointer;
          transition: var(--transition);
        }

        .hours-nav-btn:hover {
          border-color: var(--purple);
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
        }

        .hours-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 7px;
        }

        .hours-dot {
          width: 9px;
          height: 9px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: var(--transition);
        }

        .hours-dot.active {
          width: 25px;
          border-radius: 6px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316);
        }

        .hours-dot:focus-visible,
        .hours-nav-btn:focus-visible {
          outline: 3px solid rgba(139, 92, 246, 0.4);
          outline-offset: 3px;
        }

        /* ==========================================
           FOOTER
           ========================================== */
        .contact-footer {
          padding: 38px 20px 25px;
          background:
            radial-gradient(circle at 10% 0%, rgba(139, 92, 246, 0.22), transparent 35%),
            radial-gradient(circle at 90% 100%, rgba(236, 72, 153, 0.18), transparent 35%),
            linear-gradient(145deg, #0f172a, #1e293b);
          color: #cbd5e1;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .contact-footer::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #f97316, #facc15, #22c55e, #14b8a6, #0284c7);
        }

        .contact-footer p {
          margin: 0 0 9px;
          font-size: 0.9rem;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        .contact-footer p:first-child {
          color: white;
          font-weight: 750;
        }

        /* ==========================================
           TABLET
           ========================================== */
        @media (max-width: 1000px) {
          .contact-navbar {
            padding-right: 4%;
            padding-left: 4%;
          }

          .contact-nav {
            gap: 16px;
          }

          .cards-container {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            max-width: 850px;
          }

          .contact-layout {
            grid-template-columns: minmax(0, 1fr);
            max-width: 850px;
          }

          .info-card {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: stretch;
          }

          .map-wrapper {
            height: 100%;
            min-height: 330px;
          }
        }

        /* ==========================================
           MOBILE
           ========================================== */
        @media (max-width: 600px) {
          .contact-navbar {
            position: relative;
            flex-direction: column;
            gap: 14px;
            padding: 16px 12px;
          }

          .contact-logo {
            font-size: 1rem;
            white-space: normal;
            text-align: center;
            gap: 9px;
          }

          .contact-logo-img {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
          }

          .contact-nav {
            gap: 17px;
          }

          .contact-nav a {
            font-size: 0.87rem;
          }

          .contact-call-btn {
            padding: 10px 15px;
          }

          .contact-header {
            padding: 52px 18px 58px;
          }

          .contact-header h1 {
            font-size: 2rem;
            letter-spacing: -0.7px;
          }

          .contact-header p {
            font-size: 0.95rem;
            line-height: 1.75;
          }

          .cards-container {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
            margin: -18px auto 45px;
            padding: 0 16px;
          }

          .contact-card {
            padding: 21px;
          }

          .contact-layout {
            gap: 24px;
            margin-bottom: 50px;
            padding: 0 16px;
          }

          .form-card {
            padding: 23px 17px;
            border-radius: 14px;
          }

          .form-card h2 {
            font-size: 1.55rem;
          }

          .grid-2col {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
          }

          .info-card {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .map-wrapper {
            height: 260px;
            min-height: 0;
          }

          .hours-box {
            padding: 16px 12px;
            border-radius: 14px;
          }

          .hours-box-title {
            font-size: 0.95rem;
          }

          .hours-slide-inner {
            padding: 11px 8px;
          }

          .hours-slide-icon {
            width: 36px;
            height: 36px;
            font-size: 1.1rem;
          }

          .hours-slide-title {
            font-size: 0.9rem;
          }

          .hours-slide-sub {
            font-size: 0.72rem;
          }

          .hours-row-item {
            gap: 7px;
            padding: 10px 8px;
          }

          .hours-row-label {
            font-size: 0.74rem;
          }

          .hours-row-value {
            max-width: 57%;
            font-size: 0.72rem;
          }

          .hours-nav-btn {
            width: 33px;
            height: 33px;
          }

          .contact-footer {
            padding: 30px 16px 22px;
          }
        }

        @media (max-width: 360px) {
          .contact-nav {
            gap: 12px;
          }

          .contact-nav a {
            font-size: 0.81rem;
          }

          .contact-logo-img {
            width: 36px;
            height: 36px;
            min-width: 36px;
            min-height: 36px;
          }

          .hours-box {
            padding-right: 9px;
            padding-left: 9px;
          }

          .hours-row-item {
            gap: 5px;
            padding: 9px 6px;
          }

          .hours-row-label {
            font-size: 0.69rem;
          }

          .hours-row-value {
            font-size: 0.67rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-root *,
          .contact-root *::before,
          .contact-root *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="contact-navbar">
        <Link to="/" className="contact-logo">
          <img
            src={logo}
            alt="Chintu AC Cool Care"
            className="contact-logo-img"
          />
          <span className="contact-logo-text">Chintu Cool AC Service</span>
        </Link>

        <nav className="contact-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact" className="active">Contact</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/blog">Blog</Link>
        </nav>

        <a className="contact-call-btn" href="tel:+919354397318">
          📞 93543 97318
        </a>
      </header>

      {/* HERO BANNER */}
      <section className="contact-header">
        <span className="header-badge">GET IN TOUCH</span>

        <h1>We Are Here to Assist Your Appliance Needs</h1>

        <p>
          Need urgent cooling repair or routine laundry
          appliance maintenance? Contact us directly or send
          an inquiry for doorstep service.
        </p>
      </section>

      {/* CONTACT CHANNELS */}
      <div className="cards-container">
        {contactCards.map((card) => (
          <div key={card.title} className="contact-card">
            <div
              className="card-icon"
              style={{ background: card.gradient }}
            >
              {card.icon}
            </div>

            <h3>{card.title}</h3>

            {card.details.map((detail) => (
              <p key={detail} className="card-detail">
                {detail}
              </p>
            ))}

            <a
              href={card.link}
              className="card-action"
              style={{ color: card.accent }}
              target={card.link.startsWith('https://') ? '_blank' : undefined}
              rel={card.link.startsWith('https://') ? 'noopener noreferrer' : undefined}
            >
              {card.actionText} →
            </a>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="contact-layout">
        {/* SERVICE INQUIRY FORM */}
        <section className="form-card">
          <h2>Send a Quick Service Inquiry</h2>

          <p className="sub">
            Fill in the details below and our service team
            will contact you.
          </p>

          {status.text && (
            <div className={`alert-box ${status.type}`} role="status" aria-live="polite">
              <span>{status.type === 'success' ? '✓' : '⚠'}</span>
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2col">
              <div className="field-group">
                <label htmlFor="contact-name">Your Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="field-group">
                <label htmlFor="contact-mobile">Phone Number *</label>
                <input
                  id="contact-mobile"
                  type="tel"
                  name="mobile"
                  autoComplete="tel"
                  inputMode="numeric"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a valid 10-digit mobile number"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid-2col">
              <div className="field-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={150}
                  placeholder="name@example.com (optional)"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="field-group">
                <label htmlFor="contact-city">Your City / Locality *</label>
                <input
                  id="contact-city"
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={150}
                  placeholder="e.g. Noida Sector 62 or Delhi"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="contact-service">Select Required Service *</label>
              <select
                id="contact-service"
                name="serviceType"
                required
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
              <label htmlFor="contact-message">Describe the Issue *</label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                placeholder="Mention appliance brand, symptoms, water leakage, loud sound, cooling problems, etc."
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting Details...' : 'Send Service Inquiry →'}
            </button>
          </form>
        </section>

        {/* MAP AND WORKING HOURS */}
        <section className="info-card" id="service-map">
          <div className="map-wrapper">
            <iframe
              title="Chintu Cool service area in Noida Sector 62"
              src="https://maps.google.com/maps?q=Noida%20Sector%2062&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          {/* WEEKLY SCHEDULE + DISPATCH SLIDER */}
          <div className="hours-box">
            <h3 className="hours-box-title">⏰ Working & Dispatch Hours</h3>

            <div
              className="hours-slider"
              ref={sliderRef}
              onScroll={handleSlideScroll}
              aria-label="Working hours and dispatch information"
            >
              {hoursSlides.map((slide, index) => (
                <div
                  key={slide.title}
                  className="hours-slide"
                  aria-label={`Slide ${index + 1} of ${hoursSlides.length}`}
                >
                  <div className="hours-slide-inner">
                    <div className="hours-slide-header">
                      <div
                        className="hours-slide-icon"
                        style={{ background: slide.gradient }}
                      >
                        {slide.icon}
                      </div>

                      <div className="hours-slide-heading">
                        <h4 className="hours-slide-title">{slide.title}</h4>
                        <div className="hours-slide-sub">{slide.subtitle}</div>
                      </div>
                    </div>

                    <div className="hours-rows">
                      {slide.rows.map((row) => (
                        <div
                          key={row.label}
                          className={`hours-row-item ${row.emergency ? 'emergency' : ''}`}
                        >
                          <span className="hours-row-label">{row.label}</span>
                          <span
                            className="hours-row-value"
                            style={{ color: row.emergency ? undefined : slide.accent }}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SLIDER NAVIGATION */}
            <div className="hours-controls">
              <button
                type="button"
                className="hours-nav-btn"
                onClick={handlePrevSlide}
                aria-label="Previous slide"
              >
                ❮
              </button>

              <div className="hours-dots" aria-label="Choose information slide">
                {hoursSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    className={`hours-dot ${index === hoursSlide ? 'active' : ''}`}
                    onClick={() => scrollToSlide(index)}
                    aria-label={`Show ${slide.title}`}
                    aria-current={index === hoursSlide ? 'true' : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                className="hours-nav-btn"
                onClick={handleNextSlide}
                aria-label="Next slide"
              >
                ❯
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="contact-footer">
        <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
        <p>Doorstep AC, Refrigerator, and Washing Machine Repair Services in Delhi NCR.</p>
      </footer>
    </div>
  );
}