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
// Import 29 States & 25 Famous Cities Data
import { STATE_CITY_DATA, APPLIANCE_SERVICES } from '../data/locationData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'businesses'

  // Dynamic Live Top Stats
  const [stats, setStats] = useState({
    totalBusiness: 0,
    totalPaid: 0,
    totalLead: 0,
    totalContact: 0
  });

  // Sidebar Filter States
  const [sidebarFilters, setSidebarFilters] = useState({
    state: 'All',
    city: 'All',
    service: 'All'
  });

  // Inquiry States
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('day');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [viewItem, setViewItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  // Business States
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

  // New Booking State
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

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Dynamic Stats Fetcher
  const fetchStats = async () => {
    try {
      const res = await API.get('/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  // Fetch Inquiries with Sidebar Filters
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

  // Fetch Businesses with Sidebar Filters
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

  // Fetch Analytics
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
            backgroundColor: 'rgba(2, 132, 199, 0.2)',
            tension: 0.3
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
    if (activeTab === 'dashboard') {
      fetchInquiries();
    } else {
      fetchBusinesses();
    }
  }, [sidebarFilters, search, businessSearch, activeTab]);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Status Update Handler for Inquiries
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

  // Status Update Handler for Businesses
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

  // Delete Inquiry
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

  // Add Manual Booking
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/admin/inquiries', newInquiry);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNewInquiry({
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

  // Register Business
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/admin/businesses/register', newBusiness);
      if (res.data.success) {
        setIsBusinessModalOpen(false);
        setNewBusiness({
          businessName: '',
          ownerName: '',
          phone: '',
          state: 'Delhi (NCT)',
          city: 'New Delhi',
          serviceCategory: 'AC Service & Gas Charging',
          status: 'Active',
          isPaid: false
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
    setSidebarFilters({
      ...sidebarFilters,
      state: selectedState,
      city: 'All'
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .sidebar { width: 280px; background: #131c2e; color: #fff; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid #1e293b; }
        .sidebar-brand { font-size: 1.2rem; color: #ff8a00; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
        .sidebar-sub { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }
        
        .nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 13px 20px; font-size: 0.88rem; border: none; background: transparent; color: #94a3b8; cursor: pointer; text-align: left; font-weight: 600; border-left: 4px solid transparent; transition: all 0.2s; }
        .nav-btn:hover { background: #1e293b; color: #fff; }
        .nav-btn.active { background: #1e293b; color: #ff8a00; border-left: 4px solid #ff8a00; }
        
        .sidebar-filter-box { padding: 16px 20px; border-top: 1px solid #1e293b; margin-top: 10px; max-height: calc(100vh - 270px); overflow-y: auto; }
        .sidebar-filter-heading { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.8px; display: flex; justify-content: space-between; align-items: center; }
        .filter-group { margin-bottom: 12px; }
        .filter-group label { display: block; font-size: 0.75rem; color: #cbd5e1; font-weight: 600; margin-bottom: 4px; }
        .filter-group select { width: 100%; padding: 8px 10px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 0.82rem; outline: none; }
        .filter-group select:focus { border-color: #ff8a00; }
        .btn-reset-filters { background: transparent; border: none; color: #f87171; font-size: 0.7rem; cursor: pointer; font-weight: 600; text-decoration: underline; }

        .main-content { flex: 1; padding: 25px; overflow-y: auto; }
        .top-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: #fff; padding: 18px 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-top: 4px solid #cbd5e1; }
        .stat-title { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0; }
        .stat-val { font-size: 1.8rem; font-weight: 800; margin: 8px 0 0; color: #1e293b; }
        
        .table-container { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
        th { background: #f8fafc; color: #475569; padding: 12px 16px; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        tr:hover { background: #f8fafc; }
        
        .status-select {
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          outline: none;
        }
        .status-pending { background-color: #fef3c7; color: #b45309; border-color: #fcd34d; }
        .status-resolved { background-color: #dcfce7; color: #15803d; border-color: #86efac; }
        .status-progress { background-color: #e0f2fe; color: #0369a1; border-color: #7dd3fc; }

        .admin-action-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
        .btn-view { background-color: #e0f2fe; color: #0369a1; margin-right: 6px; }
        .btn-delete { background-color: #fee2e2; color: #dc2626; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
        .modal-box { background: #ffffff; width: 100%; max-width: 520px; border-radius: 12px; padding: 2rem; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); max-height: 90vh; overflow-y: auto; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.3rem; cursor: pointer; color: #64748b; }
        .form-field { margin-bottom: 14px; display: flex; flex-direction: column; }
        .form-field label { font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: #334155; }
        .form-field input, .form-field select, .form-field textarea { padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-brand">Chintu Ac Service</h2>
          <div className="sidebar-sub">Admin Control Portal</div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ marginTop: '10px' }}>
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

        {/* Location & Service Filters */}
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
              <option value="All">{sidebarFilters.state === 'All' ? 'Select State First' : 'All Cities'}</option>
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

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button 
            onClick={handleLogout} 
            style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>
              {activeTab === 'dashboard' ? 'Customer Inquiries & Leads' : 'Registered Businesses'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Chintu Ac Service / {activeTab.toUpperCase()}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setIsBusinessModalOpen(true)} 
              style={{ background: '#ff8a00', color: '#fff', padding: '10px 18px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              + Add Business
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              style={{ background: '#0284c7', color: '#fff', padding: '10px 18px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              + Add Booking
            </button>
          </div>
        </div>

        {actionStatus && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #a7f3d0' }}>
            {actionStatus}
          </div>
        )}

        {/* Dynamic Live Metric Cards */}
        <div className="top-stats-grid">
          <div className="stat-card" style={{ borderTopColor: '#ff8a00' }}>
            <p className="stat-title">Total Business</p>
            <p className="stat-val">{stats.totalBusiness}</p>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#10b981' }}>
            <p className="stat-title">Total Paid</p>
            <p className="stat-val">{stats.totalPaid}</p>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#3b82f6' }}>
            <p className="stat-title">Total Lead</p>
            <p className="stat-val">{stats.totalLead}</p>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#14b8a6' }}>
            <p className="stat-title">Total Contact</p>
            <p className="stat-val">{stats.totalContact}</p>
          </div>
        </div>

        {/* TAB 1: INQUIRIES & ANALYTICS */}
        {activeTab === 'dashboard' && (
          <>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Analytics Overview</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['day', 'month', 'year'].map((item) => (
                    <button 
                      key={item}
                      onClick={() => setRange(item)}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '4px', 
                        border: '1px solid #cbd5e1', 
                        background: range === item ? '#0284c7' : '#fff', 
                        color: range === item ? '#fff' : '#475569', 
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontWeight: 600
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '280px', position: 'relative', marginTop: '15px' }}>
                {chartData.labels.length > 0 ? (
                  <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <p>Data load ho raha hai...</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Search Inquiries (Name, Mobile, City)..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ maxWidth: '400px', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button onClick={fetchInquiries} style={{ padding: '9px 18px', borderRadius: '6px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Search
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Service Type</th>
                    <th>Status (Action)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length > 0 ? (
                    inquiries.map((inq) => {
                      const currentStatus = inq.status || 'Pending';
                      const statusClass = 
                        currentStatus === 'Resolved' ? 'status-resolved' :
                        currentStatus === 'In Progress' ? 'status-progress' : 'status-pending';

                      return (
                        <tr key={inq._id}>
                          <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                          <td><strong>{inq.name}</strong></td>
                          <td>
                            <a href={`tel:${inq.mobile}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                              📞 {inq.mobile}
                            </a>
                          </td>
                          <td>{inq.state || 'Delhi (NCT)'}</td>
                          <td>{inq.city}</td>
                          <td>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {inq.serviceType}
                            </span>
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
                            <button className="admin-action-btn btn-view" onClick={() => setViewItem(inq)}>View</button>
                            <button className="admin-action-btn btn-delete" onClick={() => handleDelete(inq._id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No inquiries found for selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: BUSINESS MANAGEMENT */}
        {activeTab === 'businesses' && (
          <>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Search Business Name, City or Phone..." 
                value={businessSearch} 
                onChange={(e) => setBusinessSearch(e.target.value)} 
                style={{ maxWidth: '400px', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button onClick={fetchBusinesses} style={{ padding: '9px 18px', borderRadius: '6px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Search
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner Name</th>
                    <th>State</th>
                    <th>City / Location</th>
                    <th>Contact</th>
                    <th>Core Service Offering</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.length > 0 ? (
                    businesses.map((biz) => {
                      const bizStatus = biz.status || 'Active';
                      const bizStatusClass =
                        bizStatus === 'Active' ? 'status-resolved' :
                        bizStatus === 'Inactive' ? 'status-pending' : 'btn-delete';

                      return (
                        <tr key={biz._id}>
                          <td><strong>{biz.businessName}</strong></td>
                          <td>{biz.ownerName}</td>
                          <td>{biz.state || 'Delhi (NCT)'}</td>
                          <td>{biz.city}</td>
                          <td>
                            <a href={`tel:${biz.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                              📞 {biz.phone}
                            </a>
                          </td>
                          <td>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {biz.serviceCategory}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`status-select ${bizStatusClass}`}
                              value={bizStatus}
                              onChange={(e) => handleBusinessStatusChange(biz._id, e.target.value)}
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No registered businesses found for selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* VIEW INQUIRY DETAILS MODAL */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📋 Inquiry Full Specification</h3>
              <span style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: viewItem.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                color: viewItem.status === 'Resolved' ? '#15803d' : '#b45309',
                border: `1px solid ${viewItem.status === 'Resolved' ? '#86efac' : '#fcd34d'}`
              }}>
                {viewItem.status || 'Pending'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem' }}>
              <div><strong>Customer Name:</strong> {viewItem.name}</div>
              <div>
                <strong>Contact Number:</strong>{' '}
                <a href={`tel:${viewItem.mobile}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                  📞 {viewItem.mobile}
                </a>
              </div>
              <div><strong>Email Address:</strong> {viewItem.email || 'N/A'}</div>
              <div><strong>State & City:</strong> {viewItem.city}, {viewItem.state || 'Delhi (NCT)'}</div>
              <div><strong>Service Category:</strong> {viewItem.serviceType}</div>
              <div><strong>Preferred Visit Date:</strong> {viewItem.date ? new Date(viewItem.date).toLocaleDateString() : 'Immediate Visit'}</div>
              <div><strong>Inquiry Received On:</strong> {new Date(viewItem.createdAt).toLocaleString()}</div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#475569' }}>Issue Description:</strong>
                <p style={{ margin: '6px 0 0', color: '#1e293b', lineHeight: 1.4 }}>{viewItem.message}</p>
              </div>

              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Update Lead Status:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(viewItem._id, 'Pending')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: viewItem.status === 'Pending' ? '2px solid #b45309' : '1px solid #cbd5e1',
                      background: viewItem.status === 'Pending' ? '#fef3c7' : '#ffffff',
                      color: '#b45309'
                    }}
                  >
                    ⏳ Mark as Pending
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(viewItem._id, 'Resolved')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: viewItem.status === 'Resolved' ? '2px solid #15803d' : '1px solid #cbd5e1',
                      background: viewItem.status === 'Resolved' ? '#dcfce7' : '#ffffff',
                      color: '#15803d'
                    }}
                  >
                    ✅ Mark as Resolved
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewItem(null)}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '9px',
                  background: '#64748b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BOOKING MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 15px' }}>Add Manual Booking</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-field">
                <label>Customer Name *</label>
                <input type="text" required placeholder="Enter full name" value={newInquiry.name} onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Mobile Number *</label>
                <input type="tel" required placeholder="10-digit mobile number" value={newInquiry.mobile} onChange={(e) => setNewInquiry({ ...newInquiry, mobile: e.target.value })} />
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
                <label>City </label>
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
                <select value={newInquiry.serviceType} onChange={(e) => setNewInquiry({ ...newInquiry, serviceType: e.target.value })}>
                  {APPLIANCE_SERVICES.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select value={newInquiry.status} onChange={(e) => setNewInquiry({ ...newInquiry, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-field">
                <label>Preferred Visit Date</label>
                <input type="date" value={newInquiry.date} onChange={(e) => setNewInquiry({ ...newInquiry, date: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Issue Description *</label>
                <textarea rows="3" required placeholder="Appliance model, issue details..." value={newInquiry.message} onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                Save Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER BUSINESS MODAL */}
      {isBusinessModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBusinessModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBusinessModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 15px' }}>Register New Business Vendor</h3>
            <form onSubmit={handleBusinessSubmit}>
              <div className="form-field">
                <label>Business / Agency Name *</label>
                <input type="text" required placeholder="e.g. Chintu Quick Repair" value={newBusiness.businessName} onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Owner / Technician Name *</label>
                <input type="text" required placeholder="Owner full name" value={newBusiness.ownerName} onChange={(e) => setNewBusiness({ ...newBusiness, ownerName: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Contact Phone Number *</label>
                <input type="tel" required placeholder="Vendor phone number" value={newBusiness.phone} onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })} />
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
                <label>Operating City </label>
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
                <select value={newBusiness.serviceCategory} onChange={(e) => setNewBusiness({ ...newBusiness, serviceCategory: e.target.value })}>
                  {APPLIANCE_SERVICES.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#ff8a00', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                Register Business
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}