import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      icon: '❄️',
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
      icon: '🧊',
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
      icon: '🧺',
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

  const tabs = [
    { id: 'all', label: 'All Services', icon: '🏠' },
    { id: 'ac', label: 'Air Conditioners', icon: '❄️' },
    { id: 'refrigerator', label: 'Refrigerators', icon: '🧊' },
    { id: 'washing', label: 'Washing Machines', icon: '🧺' }
  ];

  return (
    <div className="services-page">
      <style>{`
        :root {
          --primary: #0284c7;
          --primary-dark: #0369a1;
          --primary-deep: #075985;
          --green: #22c55e;
          --green-dark: #16a34a;
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

        .services-page *,
        .services-page *::before,
        .services-page *::after { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        /* 🔥 FULL WIDTH ROOT - kills default body margins */
        .services-page {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--text-main);
          background: linear-gradient(180deg, #f8fbff 0%, #eef8ff 100%);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          position: relative;
        }

        /* ============ NAVBAR - FULL WIDTH ============ */
        .services-page .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 3%;
          background: #ffffff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          gap: 18px;
          width: 100%;
          max-width: 100%;
          flex-wrap: wrap;
        }

        .services-page .logo {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          letter-spacing: -0.03em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .services-page .logo span { font-size: 1.5rem; }

        .services-page .navbar nav {
          display: flex;
          gap: 24px;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
        }

        .services-page .navbar nav a {
          text-decoration: none;
          color: var(--text-main);
          font-weight: 600;
          font-size: 1rem;
          position: relative;
          padding: 4px 0;
          transition: color 0.25s;
          white-space: nowrap;
        }

        .services-page .navbar nav a::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }

        .services-page .navbar nav a:hover,
        .services-page .navbar nav a.active { color: var(--primary); }

        .services-page .navbar nav a:hover::after,
        .services-page .navbar nav a.active::after { transform: scaleX(1); }

        .services-page .call-btn {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          padding: 12px 22px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 10px 20px rgba(2, 132, 199, 0.25);
          white-space: nowrap;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .services-page .call-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 26px rgba(2, 132, 199, 0.35);
          color: #fff;
        }

        /* ============ HERO - FULL WIDTH ============ */
        .services-page .services-hero {
          position: relative;
          text-align: center;
          padding: 4rem 3% 3.5rem;
          background:
            radial-gradient(circle at 90% 15%, rgba(56, 189, 248, 0.28), transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.15), transparent 40%),
            linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #ecfeff 100%);
          overflow: hidden;
          width: 100%;
          max-width: 100%;
        }

        .services-page .services-hero::before {
          content: "";
          position: absolute;
          top: -120px;
          right: -80px;
          width: 340px;
          height: 340px;
          border: 1px solid rgba(2, 132, 199, 0.15);
          border-radius: 50%;
          box-shadow: 0 0 0 40px rgba(2, 132, 199, 0.04),
                      0 0 0 80px rgba(2, 132, 199, 0.025);
          pointer-events: none;
        }

        .services-page .sub-badge {
          display: inline-block;
          background: linear-gradient(135deg, #bae6fd, #7dd3fc);
          color: var(--primary-deep);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1.3px;
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          margin-bottom: 1.2rem;
          box-shadow: 0 8px 18px rgba(56, 189, 248, 0.28);
          position: relative;
          z-index: 1;
        }

        .services-page .services-hero h1 {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          color: var(--text-main);
          line-height: 1.18;
          letter-spacing: -0.03em;
          margin: 0 auto 1rem;
          max-width: 900px;
          position: relative;
          z-index: 1;
        }

        .services-page .services-hero > p:not(.sub-badge) {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 700px;
          margin: 0 auto 2.2rem;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        /* ============ TAB FILTERS ============ */
        .services-page .tab-filters {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
        }

        .services-page .tab-filters button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.8rem 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid var(--border);
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          font-family: inherit;
        }

        .services-page .tab-filters button:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.15);
        }

        .services-page .tab-filters button.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 14px 28px rgba(2, 132, 199, 0.35);
          transform: translateY(-2px);
        }

        /* ============ CONTENT WRAPPER - FULL WIDTH ============ */
        .services-page .services-content-wrapper {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 3.5rem 3% 2rem;
          background: #ffffff;
        }

        /* Inner constraint for readability */
        .services-page .category-block {
          max-width: var(--content-width);
          margin: 0 auto 4rem;
          animation: fadeInUp 0.5s ease;
          width: 100%;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .services-page .category-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 2.5rem;
          padding: 0 1rem;
        }

        .services-page .category-header h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0 0 0.6rem;
        }

        .services-page .category-tagline {
          display: inline-block;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          margin: 0 0 1rem;
          padding: 0.4rem 1rem;
          background: rgba(2, 132, 199, 0.08);
          border-radius: 999px;
        }

        .services-page .category-desc {
          color: var(--text-muted);
          font-size: 1rem;
          line-height: 1.7;
          margin: 0;
        }

        /* ============ PLANS GRID ============ */
        .services-page .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.75rem;
          margin-bottom: 2.5rem;
          width: 100%;
        }

        .services-page .plan-card {
          position: relative;
          background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .services-page .plan-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, var(--primary), var(--green), #38bdf8);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .services-page .plan-card:hover {
          transform: translateY(-8px);
          border-color: rgba(2, 132, 199, 0.35);
          box-shadow: var(--shadow-lg);
        }

        .services-page .plan-card:hover::before { transform: scaleX(1); }

        .services-page .plan-card.highlighted {
          border-color: var(--primary);
          background: linear-gradient(160deg, #ffffff 0%, #f0f9ff 100%);
          box-shadow: 0 20px 45px rgba(2, 132, 199, 0.2);
        }

        .services-page .plan-card.highlighted::before {
          transform: scaleX(1);
          background: linear-gradient(90deg, var(--primary), #facc15);
        }

        .services-page .badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #fef08a, #facc15);
          color: #78350f;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(250, 204, 21, 0.35);
          text-transform: uppercase;
        }

        .services-page .plan-card h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 0.6rem;
          padding-right: 90px;
          line-height: 1.35;
        }

        .services-page .price-tag {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 1.3rem;
          padding-bottom: 1.3rem;
          border-bottom: 1.5px dashed var(--border);
        }

        .services-page .plan-checklist {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .services-page .plan-checklist li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        .services-page .check-mark {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: var(--green-dark);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 900;
          margin-top: 2px;
        }

        .services-page .book-service-btn {
          width: 100%;
          padding: 0.95rem 1.2rem;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.25);
          letter-spacing: 0.2px;
          font-family: inherit;
        }

        .services-page .book-service-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(2, 132, 199, 0.35);
        }

        /* ============ ISSUES BOX ============ */
        .services-page .issues-box {
          background: linear-gradient(135deg, #fff7ed, #fef2f2);
          border: 1.5px solid #fed7aa;
          border-radius: var(--radius);
          padding: 1.75rem 1.75rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .services-page .issues-box::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(180deg, #f97316, #ef4444);
        }

        .services-page .issues-box h4 {
          font-size: 1rem;
          font-weight: 800;
          color: #9a3412;
          margin: 0 0 1rem;
        }

        .services-page .issues-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.7rem;
        }

        .services-page .issue-chip {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.9rem;
          color: #7c2d12;
          line-height: 1.5;
          font-weight: 500;
        }

        .services-page .issue-chip span {
          color: #ea580c;
          font-weight: 900;
          flex-shrink: 0;
          font-size: 1.1rem;
          line-height: 1;
        }

        /* ============ GUARANTEES - FULL WIDTH ============ */
        .services-page .service-guarantees {
          padding: 4.5rem 3%;
          background:
            radial-gradient(circle at 90% 10%, rgba(2, 132, 199, 0.08), transparent 35%),
            radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.06), transparent 35%),
            #f0f9ff;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          width: 100%;
          max-width: 100%;
        }

        .services-page .service-guarantees h2 {
          text-align: center;
          font-size: clamp(1.7rem, 4vw, 2.4rem);
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
          margin: 0 auto 2.5rem;
          max-width: 700px;
          padding: 0 1rem;
        }

        .services-page .guarantees-grid {
          max-width: var(--content-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }

        .services-page .guarantee-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
        }

        .services-page .guarantee-card::before {
          content: "";
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--green));
          border-radius: 0 0 99px 99px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .services-page .guarantee-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(2, 132, 199, 0.3);
        }

        .services-page .guarantee-card:hover::before { opacity: 1; }

        .services-page .guarantee-icon {
          font-size: 2.2rem;
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          margin: 0 auto 1.1rem;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border-radius: 18px;
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.12);
          transition: transform 0.3s ease;
        }

        .services-page .guarantee-card:hover .guarantee-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .services-page .guarantee-card h3 {
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 0.6rem;
        }

        .services-page .guarantee-card p {
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.65;
          margin: 0;
        }

        /* ============ MODAL ============ */
        .services-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .services-page .modal-card {
          background: linear-gradient(180deg, #ffffff, #f8fbff);
          width: 100%;
          max-width: 500px;
          border-radius: 22px;
          position: relative;
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.35);
          max-height: 92vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }

        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .services-page .modal-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          color: #0f172a;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.25s ease;
          z-index: 2;
          font-family: inherit;
        }

        .services-page .modal-close-btn:hover {
          background: #ef4444;
          color: #ffffff;
          transform: rotate(90deg);
        }

        .services-page .booking-form {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .services-page .booking-form h3 {
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--text-main);
          margin: 0 0 0.6rem;
          padding-right: 40px;
        }

        .services-page .modal-subheading {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 1.3rem;
          padding: 0.6rem 0.85rem;
          background: rgba(2, 132, 199, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }

        .services-page .modal-subheading strong {
          color: var(--primary-dark);
        }

        .services-page .alert {
          background: #ecfdf5;
          color: #065f46;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          border: 1px solid #a7f3d0;
          font-size: 0.9rem;
          margin: 0 0 1rem;
          font-weight: 600;
        }

        .services-page .booking-form label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 10px;
          margin-bottom: 5px;
        }

        .services-page .booking-form input,
        .services-page .booking-form select,
        .services-page .booking-form textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          background: #ffffff;
          color: #0f172a;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
        }

        .services-page .booking-form textarea {
          resize: vertical;
          min-height: 85px;
        }

        .services-page .booking-form input:focus,
        .services-page .booking-form select:focus,
        .services-page .booking-form textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
        }

        .services-page .submit-btn {
          margin-top: 16px;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.98rem;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(2, 132, 199, 0.25);
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .services-page .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(2, 132, 199, 0.35);
        }

        .services-page .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============ WHATSAPP FLOAT ============ */
        .services-page .whatsapp-float {
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
          font-size: 1.6rem;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4);
          border: 3px solid rgba(255, 255, 255, 0.95);
          z-index: 1200;
          animation: waPulse 2s infinite;
          transition: all 0.25s ease;
        }

        .services-page .whatsapp-float:hover {
          transform: translateY(-4px) scale(1.05);
          animation: none;
        }

        @keyframes waPulse {
          0% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0.5); }
          70% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 16px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0); }
        }

        /* ============ FOOTER - FULL WIDTH ============ */
        .services-page .footer {
          background:
            radial-gradient(circle at 85% 0%, rgba(2, 132, 199, 0.2), transparent 30%),
            linear-gradient(145deg, #0f172a, #1e293b);
          color: #94a3b8;
          padding-top: 3.5rem;
          width: 100%;
          max-width: 100%;
        }

        .services-page .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          padding: 0 3% 3rem;
          max-width: var(--content-width);
          margin: 0 auto;
        }

        .services-page .footer-col h4 {
          color: #ffffff;
          margin-bottom: 1.2rem;
          font-size: 1.05rem;
          position: relative;
          padding-bottom: 12px;
        }

        .services-page .footer-col h4::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0;
          width: 38px;
          height: 3px;
          background: linear-gradient(90deg, #38bdf8, #4ade80);
          border-radius: 99px;
        }

        .services-page .footer-col a,
        .services-page .footer-col p {
          display: block;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 8px;
          font-size: 0.92rem;
          transition: all 0.2s ease;
        }

        .services-page .footer-col a:hover {
          color: #38bdf8;
          transform: translateX(4px);
        }

        .services-page .footer .logo {
          color: #ffffff;
          font-size: 1.2rem;
          margin-bottom: 12px;
          white-space: normal;
        }

        .services-page .footer .logo span { color: #38bdf8; }

        .services-page .footer .logo + p {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #94a3b8;
        }

        .services-page .footer-bottom {
          text-align: center;
          padding: 1.6rem 3%;
          border-top: 1px solid #1e293b;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 992px) {
          .services-page .navbar {
            padding: 1rem 3%;
          }

          .services-page .navbar nav {
            gap: 18px;
          }

          .services-page .navbar nav a { font-size: 0.95rem; }
        }

        @media (max-width: 768px) {
          .services-page .navbar {
            padding: 0.9rem 4%;
            justify-content: center;
          }

          .services-page .logo {
            font-size: 1.15rem;
          }

          .services-page .navbar nav {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px 18px;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border);
            margin-top: 0.3rem;
          }

          .services-page .navbar nav a { font-size: 0.88rem; }

          .services-page .call-btn {
            padding: 9px 14px;
            font-size: 0.85rem;
          }

          .services-page .services-hero { padding: 3rem 4% 2.5rem; }
          .services-page .services-hero h1 { font-size: clamp(1.75rem, 7vw, 2.4rem); }
          .services-page .services-hero > p:not(.sub-badge) { font-size: 1rem; }

          .services-page .tab-filters button {
            padding: 0.65rem 1.15rem;
            font-size: 0.85rem;
          }

          .services-page .services-content-wrapper { padding: 2.5rem 4% 1.5rem; }

          .services-page .plans-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .services-page .issues-list {
            grid-template-columns: 1fr;
          }

          .services-page .service-guarantees { padding: 3rem 4%; }

          .services-page .footer-grid {
            padding: 0 4% 2rem;
          }

          .services-page .whatsapp-float {
            width: 52px;
            height: 52px;
            bottom: 16px;
            right: 16px;
            font-size: 1.4rem;
          }
        }

        @media (max-width: 480px) {
          .services-page .sub-badge { font-size: 0.7rem; padding: 0.4rem 0.95rem; }
          .services-page .services-hero h1 { font-size: 1.65rem; }
          .services-page .services-hero { padding: 2.5rem 4% 2rem; }

          .services-page .tab-filters { gap: 8px; }
          .services-page .tab-filters button {
            padding: 0.55rem 0.9rem;
            font-size: 0.78rem;
            gap: 5px;
          }

          .services-page .services-content-wrapper { padding: 2rem 4% 1rem; }
          .services-page .category-block { margin-bottom: 2.5rem; }

          .services-page .plan-card { padding: 1.5rem 1.25rem; }
          .services-page .plan-card h3 { font-size: 1.08rem; padding-right: 70px; }
          .services-page .badge { font-size: 0.65rem; padding: 0.3rem 0.75rem; top: 12px; right: 12px; }

          .services-page .issues-box { padding: 1.3rem 1.25rem 1.1rem; }

          .services-page .modal-card { border-radius: 18px; }
          .services-page .booking-form { padding: 1.5rem 1.25rem; }

          .services-page .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .services-page *,
          .services-page *::before,
          .services-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
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
          <Link to="/services" className="active">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a className="call-btn" href="tel:+919354397318">📞 Call Now</a>
      </header>

      {/* ============ HERO ============ */}
      <section className="services-hero">
        <p className="sub-badge">PROFESSIONAL APPLIANCE CARE</p>
        <h1>Our Specialized Repair & Maintenance Services</h1>
        <p>
          Genuine spare parts, upfront pricing, certified technicians, and a 30-day service warranty
          across Delhi, Noida, and NCR.
        </p>

        <div className="tab-filters">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <main className="services-content-wrapper">
        {filteredCategories.map((category) => (
          <section key={category.id} className="category-block" id={category.id}>
            <div className="category-header">
              <h2>{category.category}</h2>
              <p className="category-tagline">{category.tagline}</p>
              <p className="category-desc">{category.description}</p>
            </div>

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

      {/* ============ GUARANTEES ============ */}
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

      {/* ============ MODAL ============ */}
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
                pattern="[0-9]{10}"
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

      {/* ============ WHATSAPP ============ */}
      <a
        href="https://wa.me/919354397318?text=Hello%20Chintu%20Cool%20Team,%20I%20am%20looking%20for%20doorstep%20appliance%20service."
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
            <a href="tel:+919354397318">📞 +91 93543 97318</a>
            <a href="tel:+918506994651">📞 +91 85069 94651</a>
            <a href="mailto:gaurav25543@gmail.com">✉️ gaurav25543@gmail.com</a>
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
        </div>
      </footer>
    </div>
  );
}