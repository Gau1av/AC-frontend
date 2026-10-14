import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { STATE_CITY_DATA, APPLIANCE_SERVICES } from '../data/locationData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChart, setShowChart] = useState(false);

  const [stats, setStats] = useState({
    totalBusiness: 0,
    totalPaid: 0,
    totalLead: 0,
    totalContact: 0
  });

  const [sidebarFilters, setSidebarFilters] = useState({
    state: 'All',
    city: 'All',
    service: 'All'
  });

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('day');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [viewItem, setViewItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const [businesses, setBusinesses] = useState([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    state: 'Delhi (NCT)',
    city: 'New Delhi',
    serviceCategory: 'AC Service & Gas Charging',
    status: 'Active',
    isPaid: false
  });

  const [newInquiry, setNewInquiry] = useState({
    name: '',
    mobile: '',
    email: '',
    state: 'Delhi (NCT)',
    city: 'New Delhi',
    serviceType: 'AC Service & Gas Charging',
    date: '',
    message: '',
    status: 'Pending'
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/admin/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        search,
        state: sidebarFilters.state,
        city: sidebarFilters.city,
        category: sidebarFilters.service
      });
      const res = await API.get(`/api/admin/inquiries?${params.toString()}`);
      setInquiries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const params = new URLSearchParams({
        search: businessSearch,
        state: sidebarFilters.state,
        city: sidebarFilters.city,
        category: sidebarFilters.service
      });
      const res = await API.get(`/api/admin/businesses?${params.toString()}`);
      setBusinesses(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/api/admin/analytics?range=${range}`);
      const labels = (res.data.data || []).map((item) => item._id);
      const counts = (res.data.data || []).map((item) => item.count);

      setChartData({
        labels,
        datasets: [
          {
            label: `Inquiries Trend (${range.toUpperCase()})`,
            data: counts,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3
          }
        ]
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchInquiries();
    else fetchBusinesses();
  }, [sidebarFilters, search, businessSearch, activeTab]);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const res = await API.put(`/api/admin/inquiries/${inquiryId}`, { status: newStatus });
      if (res.data.success) {
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === inquiryId ? { ...item, status: newStatus } : item
          )
        );
        setViewItem((prev) =>
          prev && prev._id === inquiryId ? { ...prev, status: newStatus } : prev
        );
        fetchStats();
        setActionStatus(`Status successfully updated to "${newStatus}"!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      console.error('Status change error:', err);
      alert(err.response?.data?.message || 'Status update karne me problem aayi.');
    }
  };

  const handleBusinessStatusChange = async (bizId, newStatus) => {
    try {
      const res = await API.put(`/api/admin/businesses/${bizId}`, { status: newStatus });
      if (res.data.success) {
        setBusinesses((prev) =>
          prev.map((biz) => (biz._id === bizId ? { ...biz, status: newStatus } : biz))
        );
        fetchStats();
        setActionStatus(`Business status updated to "${newStatus}"!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      console.error('Business status error:', err);
      alert(err.response?.data?.message || 'Status change karne me error aayi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await API.delete(`/api/admin/inquiries/${id}`);
      if (res.data.success) {
        setInquiries(inquiries.filter((inq) => inq._id !== id));
        fetchStats();
        fetchAnalytics();
        setActionStatus('Inquiry deleted successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error while deleting inquiry.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/admin/inquiries', newInquiry);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNewInquiry({
          name: '', mobile: '', email: '',
          state: 'Delhi (NCT)', city: 'New Delhi',
          serviceType: 'AC Service & Gas Charging',
          date: '', message: '', status: 'Pending'
        });
        fetchInquiries();
        fetchStats();
        fetchAnalytics();
        setActionStatus('New booking successfully added!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking add karne me issue aayi.');
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/admin/businesses/register', newBusiness);
      if (res.data.success) {
        setIsBusinessModalOpen(false);
        setNewBusiness({
          businessName: '', ownerName: '', phone: '',
          state: 'Delhi (NCT)', city: 'New Delhi',
          serviceCategory: 'AC Service & Gas Charging',
          status: 'Active', isPaid: false
        });
        fetchBusinesses();
        fetchStats();
        setActionStatus('New Business Registered successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'faced issue while registering business.');
    }
  };

  const handleSidebarStateChange = (selectedState) => {
    setSidebarFilters({ ...sidebarFilters, state: selectedState, city: 'All' });
  };

  const statCards = [
    { key: 'totalBusiness', label: 'Total Business', color: '#ff8a00', icon: '🏢', bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)' },
    { key: 'totalPaid', label: 'Total Paid', color: '#10b981', icon: '💳', bg: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)' },
    { key: 'totalLead', label: 'Total Lead', color: '#3b82f6', icon: '🎯', bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)' },
    { key: 'totalContact', label: 'Total Contact', color: '#14b8a6', icon: '📞', bg: 'linear-gradient(135deg, #f0fdfa, #99f6e4)' }
  ];

  return (
    <div className="admin-root">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden; }

        .admin-root {
          display: flex;
          min-height: 100vh;
          background:
            radial-gradient(circle at 90% 10%, rgba(2, 132, 199, 0.06), transparent 30%),
            radial-gradient(circle at 10% 90%, rgba(34, 197, 94, 0.05), transparent 30%),
            #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          width: 100%;
        }

        /* ============ SIDEBAR ============ */
        .sidebar {
          width: 290px;
          background:
            radial-gradient(circle at 80% 0%, rgba(255, 138, 0, 0.12), transparent 40%),
            linear-gradient(180deg, #131c2e 0%, #0f172a 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          box-shadow: 4px 0 24px rgba(15, 23, 42, 0.15);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
        }

        .sidebar-header {
          padding: 22px 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          position: relative;
          flex-shrink: 0;
        }

        .sidebar-header::after {
          content: "";
          position: absolute;
          bottom: 0; left: 20px;
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, #ff8a00, #facc15);
          border-radius: 99px;
        }

        .sidebar-brand {
          font-size: 1.2rem;
          color: #ff8a00;
          font-weight: 800;
          letter-spacing: 0.3px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 6px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .sidebar-nav {
          margin-top: 12px;
          padding: 0 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 13px 16px;
          font-size: 0.9rem;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          text-align: left;
          font-weight: 600;
          border-radius: 10px;
          margin-bottom: 6px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }

        .nav-btn::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #ff8a00, #facc15);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
          border-radius: 0 4px 4px 0;
        }

        .nav-btn:hover {
          background: rgba(255, 138, 0, 0.08);
          color: #fff;
          transform: translateX(2px);
        }

        .nav-btn.active {
          background: linear-gradient(135deg, rgba(255, 138, 0, 0.18), rgba(250, 204, 21, 0.08));
          color: #ff8a00;
          box-shadow: 0 6px 18px rgba(255, 138, 0, 0.15);
        }

        .nav-btn.active::before { transform: scaleY(1); }

        .sidebar-filter-box {
          padding: 16px 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
          margin-top: 12px;
        }

        .sidebar-filter-heading {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 14px;
          letter-spacing: 0.9px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filter-group { margin-bottom: 14px; }

        .filter-group label {
          display: block;
          font-size: 0.74rem;
          color: #cbd5e1;
          font-weight: 600;
          margin-bottom: 6px;
          letter-spacing: 0.2px;
        }

        .filter-group select {
          width: 100%;
          padding: 9px 12px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid #334155;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 0.83rem;
          outline: none;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-group select:hover { border-color: #475569; }
        .filter-group select:focus {
          border-color: #ff8a00;
          box-shadow: 0 0 0 3px rgba(255, 138, 0, 0.15);
        }
        .filter-group select:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-reset-filters {
          background: transparent;
          border: none;
          color: #f87171;
          font-size: 0.7rem;
          cursor: pointer;
          font-weight: 700;
          text-decoration: underline;
          padding: 0;
          font-family: inherit;
        }
        .btn-reset-filters:hover { color: #fca5a5; }

        .sidebar-logout-wrap {
          flex-shrink: 0;
          padding: 16px 20px 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.4));
        }

        .logout-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.28);
          transition: all 0.25s ease;
          font-family: inherit;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(239, 68, 68, 0.42);
          background: linear-gradient(135deg, #f87171, #ef4444);
        }

        /* ============ MAIN CONTENT ============ */
        .main-content {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
          width: 100%;
          max-width: 100%;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 14px;
        }

        .page-title {
          margin: 0;
          color: #0f172a;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .page-breadcrumb {
          font-size: 0.82rem;
          color: #64748b;
          margin-top: 4px;
          font-weight: 500;
        }
        .page-breadcrumb strong { color: #0284c7; font-weight: 700; }

        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-add-business,
        .btn-add-booking {
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .btn-add-business {
          background: linear-gradient(135deg, #ff8a00, #f97316);
          color: #fff;
          box-shadow: 0 8px 20px rgba(255, 138, 0, 0.28);
        }
        .btn-add-business:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(255, 138, 0, 0.4);
        }

        .btn-add-booking {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.28);
        }
        .btn-add-booking:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(2, 132, 199, 0.4);
        }

        .action-toast {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #065f46;
          padding: 12px 18px;
          border-radius: 10px;
          margin-bottom: 18px;
          border: 1px solid #a7f3d0;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.1);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============ STATS CARDS ============ */
        .top-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #ffffff;
          padding: 20px 22px;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.9);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          border-radius: 14px 14px 0 0;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .stat-icon-wrap {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          font-size: 1.2rem;
          margin-bottom: 12px;
        }

        .stat-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 0.6px;
        }

        .stat-val {
          font-size: 1.9rem;
          font-weight: 900;
          margin: 8px 0 0;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        /* ============ CHART TOGGLE BAR ============ */
        .chart-toggle-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.9);
        }

        .chart-toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          color: #0f172a;
          font-size: 0.98rem;
        }

        .chart-toggle-label-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border-radius: 10px;
          font-size: 1.15rem;
        }

        .chart-toggle-label-text small {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.3px;
          margin-top: 2px;
          text-transform: uppercase;
        }

        .chart-toggle-btn {
          padding: 11px 22px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.88rem;
          font-family: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
          white-space: nowrap;
        }

        .chart-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(2, 132, 199, 0.42);
        }

        .chart-toggle-btn.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .chart-toggle-btn.active:hover {
          box-shadow: 0 12px 26px rgba(239, 68, 68, 0.42);
        }

        .chart-toggle-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
          font-size: 0.9rem;
        }

        .chart-toggle-btn.active .chart-toggle-arrow {
          transform: rotate(180deg);
        }

        /* ============ CHART CARD ============ */
        .chart-card-wrapper {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.3s ease;
          opacity: 0;
          margin-bottom: 0;
        }

        .chart-card-wrapper.open {
          max-height: 600px;
          opacity: 1;
          margin-bottom: 24px;
        }

        .chart-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.9);
          position: relative;
          overflow: hidden;
        }

        .chart-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0284c7, #22c55e, #38bdf8);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
        }

        .chart-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.01em;
        }

        .chart-title::before {
          content: "";
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, #0284c7, #22c55e);
          border-radius: 99px;
        }

        .chart-range-group {
          display: inline-flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 5px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .chart-range-btn {
          padding: 8px 20px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          text-transform: capitalize;
          font-weight: 700;
          font-size: 0.82rem;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .chart-range-btn:hover {
          color: #0284c7;
          background: rgba(2, 132, 199, 0.08);
        }

        .chart-range-btn.active {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
          transform: translateY(-1px);
        }

        .chart-body {
          height: 300px;
          position: relative;
          margin-top: 10px;
        }

        .chart-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          font-size: 0.95rem;
          gap: 10px;
          font-weight: 600;
        }

        .chart-loading::before {
          content: "";
          width: 20px;
          height: 20px;
          border: 3px solid #e2e8f0;
          border-top-color: #0284c7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ============ SEARCH BAR ============ */
        .search-bar-wrap {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-input {
          max-width: 420px;
          flex: 1;
          min-width: 240px;
          padding: 11px 16px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.9rem;
          font-family: inherit;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
          color: #0f172a;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
        }

        .search-btn {
          padding: 11px 22px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #ffffff;
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
          font-size: 0.88rem;
          transition: all 0.25s ease;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.3);
        }

        /* ============ TABLE ============ */
        .table-container {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.9);
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .admin-table th {
          background: linear-gradient(180deg, #f8fafc, #f1f5f9);
          color: #475569;
          padding: 14px 16px;
          font-weight: 800;
          border-bottom: 1.5px solid #e2e8f0;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }

        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover { background: linear-gradient(90deg, #f8fafc, #ffffff); }

        .contact-link {
          color: #0284c7;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .contact-link:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        .service-tag {
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-block;
          white-space: nowrap;
        }

        .service-tag-warn {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-block;
          white-space: nowrap;
        }

        /* ============ STATUS SELECT ============ */
        .status-select {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1.5px solid #cbd5e1;
          cursor: pointer;
          outline: none;
          font-family: inherit;
          background: #ffffff;
          color: #334155;
          transition: all 0.2s ease;
        }
        .status-select:hover { border-color: #94a3b8; }
        .status-select:focus { box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }

        .status-pending { background-color: #fef3c7; color: #b45309; border-color: #fcd34d; }
        .status-resolved { background-color: #dcfce7; color: #15803d; border-color: #86efac; }
        .status-progress { background-color: #e0f2fe; color: #0369a1; border-color: #7dd3fc; }
        .status-suspended { background-color: #fee2e2; color: #b91c1c; border-color: #fecaca; }

        /* ============ ACTION BUTTONS ============ */
        .admin-action-btn {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-view {
          background-color: #e0f2fe;
          color: #0369a1;
          margin-right: 6px;
        }
        .btn-view:hover {
          background-color: #0284c7;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(2, 132, 199, 0.3);
        }

        .btn-delete {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .btn-delete:hover {
          background-color: #dc2626;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(220, 38, 38, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
          font-weight: 500;
        }
        .empty-state-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 10px;
          opacity: 0.5;
        }

        /* ============ MODAL ============ */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: modalFadeIn 0.25s ease;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-box {
          background: linear-gradient(180deg, #ffffff, #f8fbff);
          width: 100%;
          max-width: 540px;
          border-radius: 18px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.35);
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(226, 232, 240, 0.9);
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 34px;
          height: 34px;
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          font-size: 1rem;
          cursor: pointer;
          color: #64748b;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
          font-family: inherit;
          font-weight: 700;
        }
        .modal-close:hover {
          background: #ef4444;
          color: #ffffff;
          transform: rotate(90deg);
        }

        .modal-title {
          margin: 0 0 18px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 40px;
          text-align: left;
          justify-content: flex-start;
          width: 100%;
        }

        .modal-status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ============ FORM FIELDS — LEFT ALIGNED ============ */
        .form-field {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          text-align: left;
        }

        .form-field label {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 5px;
          color: #334155;
          text-align: left;
          align-self: flex-start;
          width: 100%;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #0f172a;
          text-align: left;
          box-sizing: border-box;
          display: block;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          text-align: left;
          color: #94a3b8;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
        }

        .form-field textarea {
          resize: vertical;
          min-height: 80px;
          line-height: 1.5;
        }

        .modal-submit-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
          margin-top: 6px;
        }

        .modal-submit-btn.blue {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.25);
        }
        .modal-submit-btn.orange {
          background: linear-gradient(135deg, #ff8a00, #f97316);
          box-shadow: 0 10px 22px rgba(255, 138, 0, 0.25);
        }
        .modal-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        /* ============ VIEW DETAILS MODAL ============ */
        .detail-row {
          display: flex;
          gap: 10px;
          font-size: 0.92rem;
          padding: 8px 0;
          border-bottom: 1px dashed #e2e8f0;
          color: #334155;
        }
        .detail-row:last-of-type { border-bottom: none; }
        .detail-row strong {
          color: #0f172a;
          font-weight: 800;
          min-width: 130px;
        }

        .detail-issue-box {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 14px;
          border-radius: 10px;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
        }

        .detail-issue-box strong {
          color: #475569;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-issue-box p {
          margin: 8px 0 0;
          color: #1e293b;
          line-height: 1.55;
        }

        .status-actions {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .status-actions-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .status-actions-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .status-action-btn {
          flex: 1;
          min-width: 130px;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .status-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
        }

        .status-action-btn.pending {
          color: #b45309;
          border-color: #fcd34d;
          background: #fef3c7;
        }
        .status-action-btn.pending.active {
          border: 2px solid #b45309;
          box-shadow: 0 8px 18px rgba(180, 83, 9, 0.2);
        }

        .status-action-btn.resolved {
          color: #15803d;
          border-color: #86efac;
          background: #dcfce7;
        }
        .status-action-btn.resolved.active {
          border: 2px solid #15803d;
          box-shadow: 0 8px 18px rgba(21, 128, 61, 0.2);
        }

        .close-modal-btn {
          margin-top: 14px;
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #64748b, #475569);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s ease;
        }
        .close-modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(71, 85, 105, 0.3);
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 1024px) {
          .sidebar { width: 250px; }
          .main-content { padding: 24px 22px; }
        }

        @media (max-width: 768px) {
          .admin-root { flex-direction: column; }
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid rgba(148, 163, 184, 0.15);
            max-height: none;
          }
          .sidebar-scroll { overflow-y: visible; }
          .main-content { padding: 20px 16px; }
          .page-header { flex-direction: column; align-items: flex-start; }
          .header-actions { width: 100%; }
          .btn-add-business, .btn-add-booking { flex: 1; justify-content: center; }
          .chart-body { height: 240px; }
          .chart-range-group { width: 100%; justify-content: center; }
          .chart-range-btn { flex: 1; padding: 8px 10px; }
          .top-stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
          .stat-val { font-size: 1.5rem; }
          .chart-toggle-bar { flex-direction: column; align-items: stretch; }
          .chart-toggle-btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 480px) {
          .sidebar-brand { font-size: 1.05rem; }
          .sidebar-sub { font-size: 0.65rem; }
          .nav-btn { padding: 11px 14px; font-size: 0.85rem; }
          .main-content { padding: 16px 12px; }
          .page-title { font-size: 1.2rem; }
          .chart-range-group { flex-wrap: wrap; border-radius: 12px; }
          .chart-range-btn { font-size: 0.75rem; padding: 7px 8px; }
          .admin-table th, .admin-table td { padding: 10px 12px; font-size: 0.8rem; }
          .stat-val { font-size: 1.35rem; }
          .modal-box { padding: 1.5rem 1.2rem; border-radius: 14px; }
          .chart-toggle-label { font-size: 0.9rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ============ SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <div className="sidebar-header">
            <h2 className="sidebar-brand">❄ Chintu Ac Service</h2>
            <div className="sidebar-sub">Admin Control Portal</div>
          </div>

          <div className="sidebar-nav">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Inquiries & Analytics
            </button>
            <button
              className={`nav-btn ${activeTab === 'businesses' ? 'active' : ''}`}
              onClick={() => setActiveTab('businesses')}
            >
              🏢 Business Management
            </button>
          </div>

          <div className="sidebar-filter-box">
            <div className="sidebar-filter-heading">
              <span>Filter Location & Service</span>
              {(sidebarFilters.state !== 'All' || sidebarFilters.city !== 'All' || sidebarFilters.service !== 'All') && (
                <button
                  className="btn-reset-filters"
                  onClick={() => setSidebarFilters({ state: 'All', city: 'All', service: 'All' })}
                >
                  Reset
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>State ({Object.keys(STATE_CITY_DATA).length} States)</label>
              <select
                value={sidebarFilters.state}
                onChange={(e) => handleSidebarStateChange(e.target.value)}
              >
                <option value="All">All States</option>
                {Object.keys(STATE_CITY_DATA).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>City (25 Famous Cities)</label>
              <select
                value={sidebarFilters.city}
                onChange={(e) => setSidebarFilters({ ...sidebarFilters, city: e.target.value })}
                disabled={sidebarFilters.state === 'All'}
              >
                <option value="All">
                  {sidebarFilters.state === 'All' ? 'Select State First' : 'All Cities'}
                </option>
                {sidebarFilters.state !== 'All' && STATE_CITY_DATA[sidebarFilters.state]?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Appliance Service</label>
              <select
                value={sidebarFilters.service}
                onChange={(e) => setSidebarFilters({ ...sidebarFilters, service: e.target.value })}
              >
                <option value="All">All Services</option>
                {APPLIANCE_SERVICES.map((srv) => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="sidebar-logout-wrap">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              {activeTab === 'dashboard' ? '📋 Customer Inquiries & Leads' : '🏢 Registered Businesses'}
            </h2>
            <div className="page-breadcrumb">
              Chintu Ac Service / <strong>{activeTab.toUpperCase()}</strong>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn-add-business" onClick={() => setIsBusinessModalOpen(true)}>
              + Add Business
            </button>
            <button className="btn-add-booking" onClick={() => setIsAddModalOpen(true)}>
              + Add Booking
            </button>
          </div>
        </div>

        {actionStatus && (
          <div className="action-toast">
            <span>✅</span>
            <span>{actionStatus}</span>
          </div>
        )}

        {/* Dynamic Live Metric Cards */}
        <div className="top-stats-grid">
          {statCards.map((card) => (
            <div key={card.key} className="stat-card" style={{ borderTop: `4px solid ${card.color}` }}>
              <div className="stat-icon-wrap" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <p className="stat-title">{card.label}</p>
              <p className="stat-val">{stats[card.key]}</p>
            </div>
          ))}
        </div>

        {/* ============ TAB 1: INQUIRIES ============ */}
        {activeTab === 'dashboard' && (
          <>
            <div className="chart-toggle-bar">
              <div className="chart-toggle-label">
                <span className="chart-toggle-label-icon">📈</span>
                <div className="chart-toggle-label-text">
                  Analytics Overview
                  <small>Inquiry trend visualization</small>
                </div>
              </div>

              <button
                className={`chart-toggle-btn ${showChart ? 'active' : ''}`}
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? (
                  <>
                    <span className="chart-toggle-arrow">▲</span>
                    Hide Chart
                  </>
                ) : (
                  <>
                    <span className="chart-toggle-arrow">▼</span>
                    Show Chart
                  </>
                )}
              </button>
            </div>

            <div className={`chart-card-wrapper ${showChart ? 'open' : ''}`}>
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">📊 Inquiry Trend</h3>
                  <div className="chart-range-group">
                    {['day', 'month', 'year'].map((item) => (
                      <button
                        key={item}
                        className={`chart-range-btn ${range === item ? 'active' : ''}`}
                        onClick={() => setRange(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-body">
                  {chartData.labels.length > 0 ? (
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top',
                            labels: {
                              font: { size: 12, weight: '600' },
                              color: '#475569',
                              usePointStyle: true,
                              padding: 15
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { color: '#64748b', font: { size: 11 } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: '#64748b', font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="chart-loading">Loading chart data...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="search-bar-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search Inquiries (Name, Mobile, City)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn" onClick={fetchInquiries}>
                Search
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Service Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length > 0 ? (
                    inquiries.map((inq) => {
                      const currentStatus = inq.status || 'Pending';
                      const statusClass =
                        currentStatus === 'Resolved' ? 'status-resolved' :
                        currentStatus === 'In Progress' ? 'status-progress' :
                        currentStatus === 'Cancelled' ? 'status-suspended' : 'status-pending';

                      return (
                        <tr key={inq._id}>
                          <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                          <td><strong>{inq.name}</strong></td>
                          <td>
                            <a href={`tel:${inq.mobile}`} className="contact-link">
                              📞 {inq.mobile}
                            </a>
                          </td>
                          <td>{inq.state || 'Delhi (NCT)'}</td>
                          <td>{inq.city}</td>
                          <td>
                            <span className="service-tag">{inq.serviceType}</span>
                          </td>
                          <td>
                            <select
                              className={`status-select ${statusClass}`}
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="In Progress">🔄 In Progress</option>
                              <option value="Resolved">✅ Resolved</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button className="admin-action-btn btn-view" onClick={() => setViewItem(inq)}>
                              👁 View
                            </button>
                            <button className="admin-action-btn btn-delete" onClick={() => handleDelete(inq._id)}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state">
                          <span className="empty-state-icon">📭</span>
                          No inquiries found for selected filters.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ TAB 2: BUSINESSES ============ */}
        {activeTab === 'businesses' && (
          <>
            <div className="search-bar-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search Business Name, City or Phone..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
              />
              <button className="search-btn" onClick={fetchBusinesses}>
                Search
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.length > 0 ? (
                    businesses.map((biz) => {
                      const bizStatus = biz.status || 'Active';
                      const bizStatusClass =
                        bizStatus === 'Active' ? 'status-resolved' :
                        bizStatus === 'Inactive' ? 'status-pending' : 'status-suspended';

                      return (
                        <tr key={biz._id}>
                          <td><strong>{biz.businessName}</strong></td>
                          <td>{biz.ownerName}</td>
                          <td>{biz.state || 'Delhi (NCT)'}</td>
                          <td>{biz.city}</td>
                          <td>
                            <a href={`tel:${biz.phone}`} className="contact-link">
                              📞 {biz.phone}
                            </a>
                          </td>
                          <td>
                            <span className="service-tag-warn">{biz.serviceCategory}</span>
                          </td>
                          <td>
                            <select
                              className={`status-select ${bizStatusClass}`}
                              value={bizStatus}
                              onChange={(e) => handleBusinessStatusChange(biz._id, e.target.value)}
                            >
                              <option value="Active">✅ Active</option>
                              <option value="Inactive">⏳ Inactive</option>
                              <option value="Suspended">❌ Suspended</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state">
                          <span className="empty-state-icon">🏢</span>
                          No registered businesses found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ============ VIEW INQUIRY DETAILS MODAL ============ */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '40px' }}>
              <h3 className="modal-title" style={{ margin: 0, paddingRight: 0 }}>📋 Inquiry Details</h3>
              <span
                className="modal-status-badge"
                style={{
                  background: viewItem.status === 'Resolved' ? '#dcfce7' : viewItem.status === 'In Progress' ? '#e0f2fe' : '#fef3c7',
                  color: viewItem.status === 'Resolved' ? '#15803d' : viewItem.status === 'In Progress' ? '#0369a1' : '#b45309'
                }}
              >
                {viewItem.status || 'Pending'}
              </span>
            </div>

            <div>
              <div className="detail-row"><strong>Customer Name:</strong> {viewItem.name}</div>
              <div className="detail-row">
                <strong>Contact Number:</strong>
                <a href={`tel:${viewItem.mobile}`} className="contact-link">📞 {viewItem.mobile}</a>
              </div>
              <div className="detail-row"><strong>Email:</strong> {viewItem.email || 'N/A'}</div>
              <div className="detail-row"><strong>State & City:</strong> {viewItem.city}, {viewItem.state || 'Delhi (NCT)'}</div>
              <div className="detail-row"><strong>Service:</strong> {viewItem.serviceType}</div>
              <div className="detail-row">
                <strong>Visit Date:</strong>
                {viewItem.date ? new Date(viewItem.date).toLocaleDateString() : 'Immediate Visit'}
              </div>
              <div className="detail-row">
                <strong>Received On:</strong>
                {new Date(viewItem.createdAt).toLocaleString()}
              </div>

              <div className="detail-issue-box">
                <strong>Issue Description</strong>
                <p>{viewItem.message}</p>
              </div>

              <div className="status-actions">
                <span className="status-actions-label">Update Lead Status</span>
                <div className="status-actions-grid">
                  <button
                    type="button"
                    className={`status-action-btn pending ${viewItem.status === 'Pending' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(viewItem._id, 'Pending')}
                  >
                    ⏳ Mark Pending
                  </button>
                  <button
                    type="button"
                    className={`status-action-btn resolved ${viewItem.status === 'Resolved' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(viewItem._id, 'Resolved')}
                  >
                    ✅ Mark Resolved
                  </button>
                </div>
              </div>

              <button type="button" className="close-modal-btn" onClick={() => setViewItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD BOOKING MODAL ============ */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            <h3 className="modal-title">📝 Add Manual Booking</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-field">
                <label>Customer Name *</label>
                <input
                  type="text" required placeholder="Enter full name"
                  value={newInquiry.name}
                  onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Mobile Number *</label>
                <input
                  type="tel" required placeholder="10-digit mobile number"
                  value={newInquiry.mobile}
                  onChange={(e) => setNewInquiry({ ...newInquiry, mobile: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>State *</label>
                <select
                  value={newInquiry.state}
                  onChange={(e) => {
                    const st = e.target.value;
                    setNewInquiry({ ...newInquiry, state: st, city: STATE_CITY_DATA[st]?.[0] || '' });
                  }}
                >
                  {Object.keys(STATE_CITY_DATA).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>City</label>
                <select
                  value={newInquiry.city}
                  onChange={(e) => setNewInquiry({ ...newInquiry, city: e.target.value })}
                >
                  {STATE_CITY_DATA[newInquiry.state]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Service Category *</label>
                <select
                  value={newInquiry.serviceType}
                  onChange={(e) => setNewInquiry({ ...newInquiry, serviceType: e.target.value })}
                >
                  {APPLIANCE_SERVICES.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  value={newInquiry.status}
                  onChange={(e) => setNewInquiry({ ...newInquiry, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-field">
                <label>Preferred Visit Date</label>
                <input
                  type="date"
                  value={newInquiry.date}
                  onChange={(e) => setNewInquiry({ ...newInquiry, date: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Issue Description *</label>
                <textarea
                  rows="3" required
                  placeholder="Appliance model, issue details..."
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                />
              </div>

              <button type="submit" className="modal-submit-btn blue">
                💾 Save Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ REGISTER BUSINESS MODAL ============ */}
      {isBusinessModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBusinessModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBusinessModalOpen(false)}>✕</button>
            <h3 className="modal-title">🏢 Register New Business</h3>
            <form onSubmit={handleBusinessSubmit}>
              <div className="form-field">
                <label>Business / Agency Name *</label>
                <input
                  type="text" required placeholder="e.g. Chintu Quick Repair"
                  value={newBusiness.businessName}
                  onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Owner / Technician Name *</label>
                <input
                  type="text" required placeholder="Owner full name"
                  value={newBusiness.ownerName}
                  onChange={(e) => setNewBusiness({ ...newBusiness, ownerName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Contact Phone Number *</label>
                <input
                  type="tel" required placeholder="Vendor phone number"
                  value={newBusiness.phone}
                  onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Operating State *</label>
                <select
                  value={newBusiness.state}
                  onChange={(e) => {
                    const st = e.target.value;
                    setNewBusiness({ ...newBusiness, state: st, city: STATE_CITY_DATA[st]?.[0] || '' });
                  }}
                >
                  {Object.keys(STATE_CITY_DATA).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Operating City</label>
                <select
                  value={newBusiness.city}
                  onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                >
                  {STATE_CITY_DATA[newBusiness.state]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Appliance Service Specialty *</label>
                <select
                  value={newBusiness.serviceCategory}
                  onChange={(e) => setNewBusiness({ ...newBusiness, serviceCategory: e.target.value })}
                >
                  {APPLIANCE_SERVICES.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="modal-submit-btn orange">
                🚀 Register Business
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}