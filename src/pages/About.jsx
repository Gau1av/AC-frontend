import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Asset images for visual richness
import storyImage from '../assets/2.jpeg';

export default function About() {
  const stats = [
    { number: '10+', label: 'Years of Experience', icon: '🏆' },
    { number: '8,500+', label: 'Appliances Repaired', icon: '🔧' },
    { number: '4.9/5', label: 'Customer Rating', icon: '⭐' },
    { number: '35+', label: 'Certified Technicians', icon: '👨‍🔧' }
  ];

  const coreValues = [
    {
      icon: '🎯',
      title: 'Accuracy in Diagnostics',
      description: 'We prioritize diagnosing the exact root cause of an appliance breakdown using digital multimeters, vacuum gauges, and OEM testing instruments rather than guess-work.',
      gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
    },
    {
      icon: '🛡️',
      title: 'Honest & Transparent Pricing',
      description: 'No hidden visit charges or forced part replacements. We inspect the appliance, present an upfront estimate, and proceed only upon your explicit approval.',
      gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
    },
    {
      icon: '⚙️',
      title: 'OEM-Grade Genuine Parts',
      description: 'Every replacement component—from AC capacitors and compressors to washing machine drive belts and fridge relays—is sourced directly from verified authorized distributors.',
      gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)'
    },
    {
      icon: '⏱️',
      title: 'Time-Bound Doorstep Service',
      description: 'We respect your schedule. Our field teams operate with optimized regional routes across Delhi, Noida, and Gurgaon to guarantee fast turnarounds.',
      gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)'
    },
    {
      icon: '🔧',
      title: 'Skilled & Verified Technicians',
      description: 'Every field engineer is background-verified, factory-trained, and carries a complete diagnostic toolkit to handle complex repairs on the very first visit.',
      gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'
    },
    {
      icon: '♻️',
      title: 'Eco-Friendly Approach',
      description: 'We use environmentally safe refrigerants, dispose of old parts responsibly, and follow energy-efficient repair practices to protect both your appliance and the planet.',
      gradient: 'linear-gradient(135deg, #ccfbf1, #99f6e4)'
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
      desc: 'Schedule a visit online or connect with us directly via phone or WhatsApp.',
      icon: '📅'
    },
    {
      step: '02',
      title: 'Doorstep Inspection',
      desc: 'A background-verified technician arrives with complete diagnostic tooling.',
      icon: '🔍'
    },
    {
      step: '03',
      title: 'Transparent Quote',
      desc: 'Receive an itemized quote detailing labor and required genuine spare parts.',
      icon: '📋'
    },
    {
      step: '04',
      title: 'Repair & 30-Day Warranty',
      desc: 'Execution of testing and repair backed by a comprehensive 30-day service warranty.',
      icon: '✅'
    }
  ];

  // ====== Values Slider Logic ======
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index) => {
    const container = sliderRef.current;
    if (!container) return;
    const card = container.children[index];
    if (card) {
      container.scrollTo({
        left: card.offsetLeft - container.offsetLeft,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = activeIndex === 0 ? coreValues.length - 1 : activeIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % coreValues.length;
    scrollToIndex(newIndex);
  };

  // Auto-detect active card on manual scroll
  const handleScroll = () => {
    const container = sliderRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.offsetWidth + 24 || 300;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < coreValues.length) {
      setActiveIndex(newIndex);
    }
  };

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % coreValues.length;
        const container = sliderRef.current;
        if (container && container.children[next]) {
          container.scrollTo({
            left: container.children[next].offsetLeft - container.offsetLeft,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [coreValues.length]);

  return (
    <div className="about-page">
      <style>{`
        :root {
          --primary: #0284c7;
          --primary-dark: #0369a1;
          --primary-deep: #075985;
          --green: #22c55e;
          --green-dark: #16a34a;
          --dark-bg: #0f172a;
          --dark-surface: #1e293b;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --bg-canvas: #f8fafc;
          --border: #e2e8f0;
          --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.06);
          --shadow-md: 0 12px 30px rgba(2, 132, 199, 0.12);
          --shadow-lg: 0 24px 50px rgba(2, 132, 199, 0.18);
          --radius: 16px;
          --radius-lg: 24px;
          --content-width: 1200px;
        }

        .about-page * { box-sizing: border-box; }

        .about-page {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--text-main);
          background: linear-gradient(180deg, #f8fbff 0%, #eef8ff 100%);
          overflow-x: hidden;
          min-height: 100vh;
        }

        .about-page .container {
          max-width: var(--content-width);
          margin: 0 auto;
          padding: 0 5%;
        }

        .about-page .text-center { text-align: center; }

        /* ============ NAVBAR ============ */
        .about-page .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 5%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
          gap: 18px;
        }

        .about-page .logo {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .about-page .logo span { font-size: 1.5rem; }

        .about-page .navbar nav {
          display: flex;
          gap: 22px;
          align-items: center;
        }

        .about-page .navbar nav a {
          text-decoration: none;
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.95rem;
          position: relative;
          padding: 4px 0;
          transition: color 0.25s;
          white-space: nowrap;
        }

        .about-page .navbar nav a::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }

        .about-page .navbar nav a:hover,
        .about-page .navbar nav a.active { color: var(--primary); }

        .about-page .navbar nav a:hover::after,
        .about-page .navbar nav a.active::after { transform: scaleX(1); }

        .about-page .call-btn {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          padding: 10px 18px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 10px 20px rgba(2, 132, 199, 0.22);
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .about-page .call-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 26px rgba(2, 132, 199, 0.3);
          color: #fff;
        }

        /* ============ HERO ============ */
        .about-page .about-hero {
          position: relative;
          text-align: center;
          padding: 5rem 5% 5.5rem;
          background:
            radial-gradient(circle at 90% 15%, rgba(56, 189, 248, 0.28), transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.18), transparent 40%),
            linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #ecfeff 100%);
          overflow: hidden;
        }

        .about-page .hero-glow-1,
        .about-page .hero-glow-2 {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .about-page .hero-glow-1 {
          top: -130px;
          right: -80px;
          width: 360px;
          height: 360px;
          border: 1px solid rgba(2, 132, 199, 0.15);
          box-shadow: 0 0 0 45px rgba(2, 132, 199, 0.04),
                      0 0 0 90px rgba(2, 132, 199, 0.025);
        }

        .about-page .hero-glow-2 {
          bottom: -120px;
          left: -70px;
          width: 280px;
          height: 280px;
          border: 1px solid rgba(34, 197, 94, 0.15);
          box-shadow: 0 0 0 40px rgba(34, 197, 94, 0.04);
        }

        .about-page .about-hero-content {
          position: relative;
          z-index: 1;
          max-width: 820px;
          margin: 0 auto;
        }

        .about-page .about-badge {
          display: inline-block;
          background: linear-gradient(135deg, #bae6fd, #7dd3fc);
          color: var(--primary-deep);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          padding: 0.45rem 1.15rem;
          border-radius: 50px;
          margin-bottom: 1.3rem;
          box-shadow: 0 8px 18px rgba(56, 189, 248, 0.28);
        }

        .about-page .about-hero h1 {
          font-size: clamp(2rem, 5vw, 3.1rem);
          font-weight: 900;
          color: var(--text-main);
          line-height: 1.18;
          letter-spacing: -0.03em;
          margin: 0 0 1.2rem;
        }

        .about-page .about-hero h1 span {
          background: linear-gradient(100deg, #0284c7, #22c55e);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-page .about-hero p {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.75;
          max-width: 720px;
          margin: 0 auto 2rem;
        }

        .about-page .hero-mini-stats {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .about-page .hero-mini-stats div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .about-page .hero-mini-stats strong {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--primary);
        }

        .about-page .hero-mini-stats span {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* ============ STATS GRID ============ */
        .about-page .about-stats-container {
          max-width: var(--content-width);
          margin: -2.5rem auto 3rem;
          padding: 0 5%;
          position: relative;
          z-index: 2;
        }

        .about-page .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .about-page .stat-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem 1.25rem;
          text-align: center;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .about-page .stat-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .about-page .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
        }

        .about-page .stat-card:hover::before { transform: scaleX(1); }

        .about-page .stat-icon {
          font-size: 1.6rem;
          margin-bottom: 0.6rem;
        }

        .about-page .stat-card h3 {
          font-size: 1.9rem;
          font-weight: 900;
          color: var(--primary);
          margin: 0 0 0.4rem;
          letter-spacing: -0.03em;
        }

        .about-page .stat-card p {
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 600;
          margin: 0;
        }

        /* ============ MISSION & STORY ============ */
        .about-page .about-section {
          padding: 3rem 5% 4rem;
        }

        .about-page .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 3.5rem;
          align-items: center;
        }

        .about-page .story-image {
          position: relative;
          border-radius: var(--radius-lg);
        }

        .about-page .story-image img {
          width: 100%;
          height: 100%;
          max-height: 480px;
          object-fit: cover;
          border-radius: var(--radius-lg);
          box-shadow: 0 24px 55px rgba(2, 132, 199, 0.22);
          border: 6px solid #ffffff;
        }

        .about-page .image-float-badge {
          position: absolute;
          bottom: -22px;
          right: -10px;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          padding: 0.9rem 1.2rem;
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(2, 132, 199, 0.22);
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border);
        }

        .about-page .image-float-badge span {
          font-size: 1.6rem;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 12px;
        }

        .about-page .image-float-badge strong {
          display: block;
          font-size: 0.92rem;
          color: var(--text-main);
          font-weight: 800;
        }

        .about-page .image-float-badge small {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .about-page .story-content .section-label {
          display: inline-block;
          color: var(--primary);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1.3px;
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .about-page .story-content h2 {
          font-size: clamp(1.7rem, 3.5vw, 2.3rem);
          font-weight: 900;
          color: var(--text-main);
          line-height: 1.22;
          letter-spacing: -0.03em;
          margin: 0 0 1rem;
        }

        .about-page .story-content p {
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .about-page .story-content strong { color: var(--primary-dark); }

        .about-page .mission-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 1.5rem;
        }

        .about-page .highlight-pill {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: var(--primary-deep);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          border: 1px solid rgba(2, 132, 199, 0.15);
        }

        /* ============ CORE PRINCIPLES SLIDER ============ */
        .about-page .values-section {
          padding: 4rem 5%;
          background:
            radial-gradient(circle at 90% 10%, rgba(2, 132, 199, 0.06), transparent 30%),
            #ffffff;
          overflow: hidden;
        }

        .about-page .values-section .section-label {
          display: inline-block;
          color: var(--green-dark);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1.3px;
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .about-page .values-section h2 {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
          margin: 0 0 0.6rem;
        }

        .about-page .section-subtext {
          color: var(--text-muted);
          font-size: 1rem;
          max-width: 620px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }

        .about-page .values-slider-wrapper {
          position: relative;
          max-width: var(--content-width);
          margin: 0 auto;
          padding: 0 60px;
        }

        .about-page .values-slider {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding: 20px 4px 30px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .about-page .values-slider::-webkit-scrollbar {
          display: none;
        }

        .about-page .value-card {
          flex: 0 0 300px;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.75rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .about-page .value-card:hover {
          transform: translateY(-8px);
          border-color: rgba(2, 132, 199, 0.3);
          box-shadow: var(--shadow-lg);
        }

        .about-page .value-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          font-size: 1.8rem;
          border-radius: 16px;
          margin-bottom: 1.1rem;
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.12);
          transition: transform 0.3s ease;
        }

        .about-page .value-card:hover .value-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .about-page .value-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 0.6rem;
        }

        .about-page .value-card p {
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.75;
          margin: 0;
        }

        .about-page .value-card-accent {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }

        .about-page .value-card:hover .value-card-accent { transform: scaleX(1); }

        /* Slider arrows */
        .about-page .values-slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--border);
          color: var(--primary-dark);
          font-size: 1.4rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(2, 132, 199, 0.15);
          z-index: 5;
          transition: all 0.25s ease;
        }

        .about-page .values-slider-btn:hover {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-50%) scale(1.08);
        }

        .about-page .values-slider-btn.prev { left: 4px; }
        .about-page .values-slider-btn.next { right: 4px; }

        /* Slider dots */
        .about-page .values-slider-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
        }

        .about-page .values-slider-dots .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          padding: 0;
        }

        .about-page .values-slider-dots .dot.active {
          width: 28px;
          border-radius: 6px;
          background: linear-gradient(90deg, var(--primary), var(--green));
        }

        /* ============ WORKFLOW ============ */
        .about-page .workflow-section {
          padding: 4rem 5% 4.5rem;
          background: linear-gradient(180deg, #f8fbff, #f0f9ff);
        }

        .about-page .workflow-section .section-label {
          display: inline-block;
          color: var(--primary);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1.3px;
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .about-page .workflow-section h2 {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
          margin: 0 0 0.6rem;
        }

        .about-page .workflow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
          position: relative;
        }

        .about-page .workflow-card {
          position: relative;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.5rem 1.75rem;
          text-align: center;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .about-page .workflow-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
          border-color: rgba(2, 132, 199, 0.3);
        }

        .about-page .workflow-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border-radius: 16px;
          font-size: 1.6rem;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 18px rgba(2, 132, 199, 0.15);
        }

        .about-page .step-num {
          position: absolute;
          top: 12px;
          right: 16px;
          font-size: 2.2rem;
          font-weight: 900;
          color: rgba(2, 132, 199, 0.08);
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .about-page .workflow-card h3 {
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 0.5rem;
        }

        .about-page .workflow-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.65;
          margin: 0;
        }

        /* ============ BRANDS ============ */
        .about-page .brands-section {
          padding: 4rem 5%;
          background: #ffffff;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .about-page .brands-section .section-label {
          display: inline-block;
          color: var(--green-dark);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1.3px;
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .about-page .brands-section h2 {
          font-size: clamp(1.7rem, 3.5vw, 2.3rem);
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
          margin: 0 0 0.6rem;
        }

        .about-page .brand-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .about-page .brand-tag {
          background: linear-gradient(135deg, #f8fafc, #eff6ff);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.65rem 1.3rem;
          border-radius: 999px;
          transition: all 0.25s ease;
          cursor: default;
        }

        .about-page .brand-tag:hover {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.25);
        }

        /* ============ CTA BANNER ============ */
        .about-page .about-cta {
          padding: 4rem 5%;
        }

        .about-page .cta-banner {
          position: relative;
          background:
            radial-gradient(circle at 90% 20%, rgba(56, 189, 248, 0.35), transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.25), transparent 40%),
            linear-gradient(135deg, #0369a1 0%, #0284c7 55%, #0ea5e9 100%);
          border-radius: var(--radius-lg);
          padding: 3.5rem 2rem;
          text-align: center;
          color: #ffffff;
          overflow: hidden;
          box-shadow: 0 28px 60px rgba(2, 132, 199, 0.35);
        }

        .about-page .cta-glow {
          position: absolute;
          top: -100px;
          right: -60px;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 50%;
          box-shadow: 0 0 0 40px rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }

        .about-page .cta-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }

        .about-page .cta-banner h2 {
          font-size: clamp(1.7rem, 4vw, 2.4rem);
          font-weight: 900;
          margin: 0 0 0.8rem;
          letter-spacing: -0.03em;
        }

        .about-page .cta-banner p {
          color: #e0f2fe;
          font-size: 1.02rem;
          margin-bottom: 1.8rem;
          line-height: 1.7;
        }

        .about-page .cta-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .about-page .cta-primary-btn,
        .about-page .cta-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.95rem 1.6rem;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.25s ease;
          font-size: 0.95rem;
        }

        .about-page .cta-primary-btn {
          background: linear-gradient(135deg, #fef08a, #facc15);
          color: #1e3a8a;
          box-shadow: 0 12px 24px rgba(250, 204, 21, 0.35);
        }

        .about-page .cta-primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(250, 204, 21, 0.45);
        }

        .about-page .cta-secondary-btn {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
        }

        .about-page .cta-secondary-btn:hover {
          background: #ffffff;
          color: var(--primary-dark);
          transform: translateY(-3px);
        }

        /* ============ WHATSAPP FLOAT ============ */
        .about-page .whatsapp-float {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 58px;
          height: 58px;
          background: linear-gradient(145deg, #4ade80, #25d366);
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4);
          border: 3px solid rgba(255, 255, 255, 0.95);
          z-index: 1200;
          animation: waPulse 2s infinite;
          transition: all 0.25s ease;
        }

        .about-page .whatsapp-float:hover {
          transform: translateY(-4px) scale(1.05);
          animation: none;
        }

        @keyframes waPulse {
          0% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0.5); }
          70% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 16px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0); }
        }

        /* ============ FOOTER ============ */
        .about-page .footer {
          background:
            radial-gradient(circle at 85% 0%, rgba(2, 132, 199, 0.2), transparent 30%),
            linear-gradient(145deg, #0f172a, #1e293b);
          color: #94a3b8;
          padding-top: 3rem;
        }

        .about-page .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          padding: 0 5% 3rem;
          max-width: var(--content-width);
          margin: 0 auto;
        }

        .about-page .footer-col h4 {
          color: #ffffff;
          margin-bottom: 1rem;
          font-size: 1.05rem;
          position: relative;
          padding-bottom: 12px;
        }

        .about-page .footer-col h4::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0;
          width: 38px;
          height: 3px;
          background: linear-gradient(90deg, #38bdf8, #4ade80);
          border-radius: 99px;
        }

        .about-page .footer-col a,
        .about-page .footer-col p {
          display: block;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 8px;
          font-size: 0.92rem;
          transition: all 0.2s ease;
        }

        .about-page .footer-col a:hover {
          color: #38bdf8;
          transform: translateX(4px);
        }

        .about-page .footer .logo {
          color: #ffffff;
          font-size: 1.15rem;
          margin-bottom: 12px;
          white-space: normal;
        }

        .about-page .footer .logo span { color: #38bdf8; }

        .about-page .footer .logo + p {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #94a3b8;
        }

        .about-page .footer-bottom {
          text-align: center;
          padding: 1.5rem 5%;
          border-top: 1px solid #1e293b;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 968px) {
          .about-page .about-story-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .about-page .story-image img { max-height: 400px; }
          .about-page .image-float-badge { bottom: -18px; right: 12px; }
        }

        @media (max-width: 768px) {
          .about-page .navbar {
            flex-wrap: wrap;
            padding: 1rem 5%;
          }

          .about-page .navbar nav {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
          }

          .about-page .navbar nav a { font-size: 0.88rem; }

          .about-page .about-hero { padding: 3.5rem 5% 4rem; }
          .about-page .about-hero h1 { font-size: clamp(1.75rem, 7vw, 2.4rem); }
          .about-page .about-hero p { font-size: 1rem; }

          .about-page .hero-mini-stats { gap: 1.5rem; }
          .about-page .hero-mini-stats strong { font-size: 1.25rem; }

          .about-page .about-stats-container { margin: -1.8rem auto 2rem; }

          .about-page .story-content h2 { font-size: 1.6rem; }
          .about-page .story-content p { font-size: 0.95rem; }

          /* Slider on mobile: full-width cards, no padding */
          .about-page .values-slider-wrapper { padding: 0; }
          .about-page .values-slider-btn { display: none; }
          .about-page .value-card {
            flex: 0 0 82%;
            max-width: 82%;
          }

          .about-page .workflow-grid {
            grid-template-columns: 1fr;
          }

          .about-page .cta-banner { padding: 2.5rem 1.5rem; }

          .about-page .cta-primary-btn,
          .about-page .cta-secondary-btn {
            width: 100%;
            justify-content: center;
          }

          .about-page .whatsapp-float {
            width: 52px;
            height: 52px;
            bottom: 16px;
            right: 16px;
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .about-page .about-badge { font-size: 0.72rem; padding: 0.4rem 0.9rem; }
          .about-page .about-hero h1 { font-size: 1.65rem; }

          .about-page .stat-card { padding: 1.4rem 1rem; }
          .about-page .stat-card h3 { font-size: 1.6rem; }

          .about-page .value-card { flex: 0 0 88%; max-width: 88%; padding: 1.6rem 1.3rem; }
          .about-page .workflow-card { padding: 1.6rem 1.25rem; }

          .about-page .brand-tag { font-size: 0.85rem; padding: 0.55rem 1rem; }

          .about-page .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-page *,
          .about-page *::before,
          .about-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* ============ NAVBAR ============ */}
      <header className="navbar">
        <Link to="/" className="logo">
          <span>❄</span> Chintu Cool AC Service
        </Link>
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

      {/* ============ HERO ============ */}
      <section className="about-hero">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="about-hero-content">
          <span className="about-badge">✨ ABOUT CHINTU COOL APPLIANCE CARE</span>
          <h1>
            Delivering Dependable Comfort to Every Home in <span>India</span>
          </h1>
          <p>
            Founded on principles of technical integrity, speed, and customer-first service,
            Chintu Cool has grown from a specialized cooling workshop into one of the most trusted
            doorstep repair providers for Air Conditioners, Refrigerators, and Washing Machines.
          </p>
          <div className="hero-mini-stats">
            <div><strong>10+</strong><span>Years</span></div>
            <div><strong>8,500+</strong><span>Happy Homes</span></div>
            <div><strong>4.9★</strong><span>Rated Service</span></div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="about-stats-container">
        <div className="about-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MISSION & STORY ============ */}
      <section className="about-section container">
        <div className="about-story-grid">
          <div className="story-image">
            <img src={storyImage} alt="Our workshop and technicians at work" />
            <div className="image-float-badge">
              <span>🏆</span>
              <div>
                <strong>Trusted Since 2025</strong>
                <small>India's Trusted Appliance Repair Brand</small>
              </div>
            </div>
          </div>

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
        </div>
      </section>

      {/* ============ CORE PRINCIPLES — SLIDER ============ */}
      <section className="values-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">WHAT DEFINES US</span>
            <h2>Our Core Principles</h2>
            <p className="section-subtext">Every technician in our uniform adheres strictly to these golden operational standards. Swipe to explore →</p>
          </div>
        </div>

        <div className="values-slider-wrapper">
          <button
            className="values-slider-btn prev"
            onClick={handlePrev}
            aria-label="Previous principle"
          >
            ❮
          </button>

          <div
            className="values-slider"
            ref={sliderRef}
            onScroll={handleScroll}
          >
            {coreValues.map((val, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon" style={{ background: val.gradient }}>
                  {val.icon}
                </div>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
                <div className="value-card-accent"></div>
              </div>
            ))}
          </div>

          <button
            className="values-slider-btn next"
            onClick={handleNext}
            aria-label="Next principle"
          >
            ❯
          </button>
        </div>

        <div className="values-slider-dots">
          {coreValues.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to principle ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section className="workflow-section container">
        <div className="text-center">
          <span className="section-label">THE PROCESS</span>
          <h2>How We Serve You</h2>
          <p className="section-subtext">A smooth, predictable repair cycle from booking to warranty sign-off.</p>
        </div>
        <div className="workflow-grid">
          {workSteps.map((step, idx) => (
            <div key={idx} className="workflow-card">
              <div className="workflow-icon">{step.icon}</div>
              <span className="step-num">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BRANDS ============ */}
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

      {/* ============ CTA ============ */}
      <section className="about-cta container">
        <div className="cta-banner">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <h2>Experiencing an Appliance Emergency?</h2>
            <p>Book a doorstep inspection today or chat with our senior service engineers for free technical guidance.</p>
            <div className="cta-actions">
              <a href="tel:+919354397318" className="cta-primary-btn">📞 Call +91 93543 97318</a>
              <Link to="/services" className="cta-secondary-btn">Explore All Services →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHATSAPP FLOAT ============ */}
      <a
        href="https://wa.me/919354397318?text=Hello%20Chintu%20Cool%20Team,%20I%20want%20to%20know%20more%20about%20your%20services."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer-grid">
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
           <p>📍 Nodia Sector 11 M 12</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chintu Cool AC Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}