import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import * as XLSX from 'xlsx';
import { STATE_CITY_DATA, APPLIANCE_SERVICES } from '../data/locationData';
import logo from '../assets/logo.jpeg';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [permissions, setPermissions] = useState(null);
  const [role, setRole] = useState('');
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

  /* ---------- INQUIRY STATE & MODAL ---------- */
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('day');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [viewItem, setViewItem] = useState(null); // POP-UP MODAL DATA
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  // 30 Inquiries per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Horizontal Quick Slider Filter
  const [inquiryQuickFilter, setInquiryQuickFilter] = useState('All');

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

  /* ---------- BLOG STATE ---------- */
  const [blogs, setBlogs] = useState([]);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState('All');
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    category: 'AC Repair',
    author: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    galleryImages: [],
    status: 'Draft'
  });

  /* ---------- EXCEL UPLOAD STATE ---------- */
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  /* ---------- REPORT STATE ---------- */
  const [reportRange, setReportRange] = useState('month');
  const [businessReport, setBusinessReport] = useState({ labels: [], datasets: [] });
  const [serviceReport, setServiceReport] = useState({ labels: [], datasets: [] });

  /* ---------- COMMENTS STATE ---------- */
  const [comments, setComments] = useState([]);
  const [commentFilter, setCommentFilter] = useState('All');
  const [commentSearch, setCommentSearch] = useState('');

  /* ---------- SUBSCRIBERS STATE ---------- */
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  /* ---------- AUTHENTICATION & ROLE DETECTION ---------- */
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    API.get('/api/admin/me')
      .then((res) => {
        const allowedSections = res.data?.data?.permissions || res.data?.permissions || [];
        const detectedRole = (res.data?.data?.role || res.data?.role || 'manager').toLowerCase();

        setRole(detectedRole);
        setPermissions(allowedSections);

        const firstTab = [
          ['dashboard', 'inquiries'],
          ['businesses', 'businesses'],
          ['blogs', 'blogs'],
          ['comments', 'comments'],
          ['subscribers', 'subscribers'],
          ['reports', 'reports']
        ].find(([, section]) => allowedSections.includes(section));

        if (firstTab) setActiveTab(firstTab[0]);
      })
      .catch((err) => {
        console.error('Admin permission fetch error:', err);
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      });
  }, [navigate]);

  const canAccess = (section) => permissions?.includes(section) || false;

  const getRoleBadge = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'owner':
        return { label: '👑 Super Admin (Owner)', bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
      case 'manager':
        return { label: '🛡️ Operations Manager', bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' };
      case 'content':
        return { label: '✍️ Content Editor', bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      default:
        return { label: `👤 ${roleName || 'Admin'}`, bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const currentRoleBadge = getRoleBadge(role);

  /* ---------- FETCHERS ---------- */
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
      setCurrentPage(1);
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

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (blogSearch) params.append('search', blogSearch);
      if (blogStatusFilter !== 'All') params.append('status', blogStatusFilter);

      const res = await API.get(`/api/admin/blogs?${params.toString()}`);
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error('Blogs error:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const [bizRes, svcRes] = await Promise.all([
        API.get(`/api/admin/reports/businesses?range=${reportRange}`),
        API.get('/api/admin/reports/inquiries')
      ]);

      setBusinessReport({
        labels: bizRes.data.data.map((d) => d._id),
        datasets: [
          {
            label: `Businesses Registered (${reportRange.toUpperCase()})`,
            data: bizRes.data.data.map((d) => d.count),
            borderColor: '#ff8a00',
            backgroundColor: 'rgba(255, 138, 0, 0.15)',
            tension: 0.35,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: '#ff8a00',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      });

      setServiceReport({
        labels: svcRes.data.data.map((d) => d._id || 'Other'),
        datasets: [
          {
            label: 'Inquiries by Service',
            data: svcRes.data.data.map((d) => d.count),
            backgroundColor: [
              '#0284c7',
              '#ff8a00',
              '#10b981',
              '#ef4444',
              '#8b5cf6',
              '#f59e0b',
              '#14b8a6',
              '#ec4899'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      });
    } catch (err) {
      console.error('Reports error:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams();
      if (commentFilter !== 'All') params.append('status', commentFilter);
      const res = await API.get(`/api/admin/comments?${params.toString()}`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error('Comments error:', err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await API.get('/api/newsletter/admin/all');
      setSubscribers(res.data.data || []);
    } catch (err) {
      console.error('Subscribers error:', err);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    if (canAccess('inquiries')) fetchStats();
    // eslint-disable-next-line
  }, [permissions]);

  useEffect(() => {
    if (activeTab === 'dashboard' && canAccess('inquiries')) fetchInquiries();
    else if (activeTab === 'businesses' && canAccess('businesses')) fetchBusinesses();
    else if (activeTab === 'blogs' && canAccess('blogs')) fetchBlogs();
    else if (activeTab === 'reports' && canAccess('reports')) fetchReports();
    else if (activeTab === 'comments' && canAccess('comments')) fetchComments();
    else if (activeTab === 'subscribers' && canAccess('subscribers')) fetchSubscribers();
    // eslint-disable-next-line
  }, [sidebarFilters, search, businessSearch, blogSearch, blogStatusFilter, activeTab, commentFilter, permissions]);

  useEffect(() => {
    if (canAccess('inquiries')) fetchAnalytics();
    // eslint-disable-next-line
  }, [range, permissions]);

  useEffect(() => {
    if (activeTab === 'reports' && canAccess('reports')) fetchReports();
    // eslint-disable-next-line
  }, [reportRange, permissions]);

  /* ---------- HANDLERS ---------- */
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
        setViewItem((prev) => (prev && prev._id === inquiryId ? { ...prev, status: newStatus } : prev));
        fetchStats();
        setActionStatus(`Status updated to "${newStatus}"!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
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
      alert(err.response?.data?.message || 'Faced issue while registering business.');
    }
  };

  const handleSidebarStateChange = (selectedState) => {
    setSidebarFilters({ ...sidebarFilters, state: selectedState, city: 'All' });
  };

  const handleScrollSlider = (offset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  /* ---------- BLOG APPROVAL & CRUD HANDLERS ---------- */
  const handleBlogStatusUpdate = async (blogId, nextStatus) => {
    try {
      const res = await API.patch(`/api/admin/blogs/${blogId}/status`, { status: nextStatus });
      if (res.data.success) {
        setBlogs((prev) =>
          prev.map((b) => (b._id === blogId ? { ...b, status: nextStatus } : b))
        );
        setActionStatus(`Blog moved to "${nextStatus}" successfully!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update blog approval status.');
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBlog,
        slug:
          newBlog.slug ||
          newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      const res = editingBlog
        ? await API.put(`/api/admin/blogs/${editingBlog._id}`, payload)
        : await API.post('/api/admin/blogs', payload);

      if (res.data.success) {
        setIsBlogModalOpen(false);
        setEditingBlog(null);
        setNewBlog({
          title: '',
          slug: '',
          category: 'AC Repair',
          author: '',
          excerpt: '',
          content: '',
          imageUrl: '',
          galleryImages: [],
          status: 'Draft'
        });
        fetchBlogs();
        setActionStatus(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Blog save failed');
    }
  };

  const handleBlogDelete = async (id) => {
    if (!window.confirm('Delete this blog post? Its comments will also be deleted.')) return;
    try {
      await API.delete(`/api/admin/blogs/${id}`);
      fetchBlogs();
      setActionStatus('Blog deleted successfully!');
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEditBlog = (b) => {
    setEditingBlog(b);
    setNewBlog({
      title: b.title || '',
      slug: b.slug || '',
      category: b.category || 'AC Repair',
      author: b.author || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      imageUrl: b.imageUrl || '',
      galleryImages: b.galleryImages || [],
      status: b.status || 'Draft'
    });
    setIsBlogModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) {
      alert('Only JPG, PNG or WEBP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await API.post('/api/admin/upload/blog-cover', formData);
      if (res.data.success) {
        setNewBlog((prev) => ({ ...prev, imageUrl: res.data.url }));
        setActionStatus('Cover image uploaded!');
        setTimeout(() => setActionStatus(''), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  /* ---------- EXCEL HANDLERS ---------- */
  const handleFileChange = (e) => {
    setUploadError('');
    setUploadPreview([]);
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setUploadError('Only .xlsx, .xls, or .csv files allowed');
      return;
    }
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        if (!rows.length) {
          setUploadError('Excel file is empty');
          return;
        }
        setUploadPreview(rows.slice(0, 5));
      } catch (err) {
        setUploadError('Could not parse file. Check format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file first');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await API.post('/api/admin/businesses/bulk-upload', formData);
      if (res.data.success) {
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadPreview([]);
        fetchBusinesses();
        fetchStats();
        setActionStatus(`${res.data.count} businesses imported successfully!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleExcel = () => {
    const sample = [
      {
        businessName: 'Chintu Quick Repair',
        ownerName: 'Ramesh Kumar',
        phone: '9876543210',
        state: 'Delhi (NCT)',
        city: 'New Delhi',
        serviceCategory: 'AC Service & Gas Charging',
        status: 'Active',
        isPaid: true
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Businesses');
    XLSX.writeFile(wb, 'business_template.xlsx');
  };

  /* ---------- COMMENT HANDLERS ---------- */
  const handleCommentStatus = async (id, status) => {
    try {
      await API.put(`/api/admin/comments/${id}`, { status });
      fetchComments();
      setActionStatus(`Comment ${status.toLowerCase()}!`);
      setTimeout(() => setActionStatus(''), 2500);
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await API.delete(`/api/admin/comments/${id}`);
      fetchComments();
      setActionStatus('Comment deleted!');
      setTimeout(() => setActionStatus(''), 2500);
    } catch (err) {
      alert('Delete failed');
    }
  };

  /* ---------- SUBSCRIBER HANDLERS ---------- */
  const handleSubscriberDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await API.delete(`/api/newsletter/admin/${id}`);
      fetchSubscribers();
      setActionStatus('Subscriber removed!');
      setTimeout(() => setActionStatus(''), 2500);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const exportSubscribersCSV = () => {
    if (!subscribers.length) return alert('No subscribers to export');
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed On'],
      ...subscribers.map((s) => [
        s.email,
        s.status,
        s.source,
        new Date(s.createdAt).toLocaleString()
      ])
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { key: 'totalBusiness', label: 'Total Business', color: '#ff8a00', icon: '🏢', bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)' },
    { key: 'totalPaid', label: 'Total Paid', color: '#10b981', icon: '💳', bg: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)' },
    { key: 'totalLead', label: 'Total Lead', color: '#3b82f6', icon: '🎯', bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)' },
    { key: 'totalContact', label: 'Total Contact', color: '#14b8a6', icon: '📞', bg: 'linear-gradient(135deg, #f0fdfa, #99f6e4)' }
  ];

  /* ---------- FILTERED & PAGINATED INQUIRIES (30 Per Page) ---------- */
  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryQuickFilter === 'All') return true;
    return inq.status === inquiryQuickFilter;
  });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage) || 1;
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredComments = comments.filter((c) => {
    if (!commentSearch) return true;
    const q = commentSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q) ||
      c.blog?.title?.toLowerCase().includes(q)
    );
  });

  const filteredSubscribers = subscribers.filter(
    (s) => !subscriberSearch || s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  if (permissions === null) {
    return (
      <div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b', fontWeight: 600 }}>
        Checking admin access & permissions…
      </div>
    );
  }

  return (
    <div className="admin-root">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow: hidden; }

        .admin-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* ============ 1. FIXED LEFT SIDEBAR ============ */
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
          height: 100vh;
          z-index: 100;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }

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
          width: 50px; height: 3px;
          background: linear-gradient(90deg, #ff8a00, #facc15);
          border-radius: 99px;
        }

        .sidebar-brand-wrap { display: flex; align-items: center; gap: 12px; }
        .sidebar-logo {
          width: 50px; height: 50px; aspect-ratio: 1 / 1; object-fit: cover;
          border-radius: 50%; border: 2px solid rgba(255, 138, 0, 0.5);
          box-shadow: 0 8px 20px rgba(255, 138, 0, 0.25);
        }
        .sidebar-brand-text { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-brand { font-size: 1.15rem; color: #ff8a00; font-weight: 800; margin: 0; line-height: 1.15; }
        .sidebar-sub { font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }

        .sidebar-role-indicator {
          margin: 14px 16px 6px;
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .sidebar-nav { margin-top: 8px; padding: 0 12px; }
        .nav-btn {
          display: flex; align-items: center; gap: 12px; width: 100%;
          padding: 13px 16px; font-size: 0.9rem; border: none; background: transparent;
          color: #94a3b8; cursor: pointer; text-align: left; font-weight: 600;
          border-radius: 10px; margin-bottom: 6px; position: relative;
          transition: all 0.2s ease;
        }
        .nav-btn:hover { background: rgba(255, 138, 0, 0.08); color: #fff; }
        .nav-btn.active {
          background: linear-gradient(135deg, rgba(255, 138, 0, 0.18), rgba(250, 204, 21, 0.08));
          color: #ff8a00; box-shadow: 0 6px 18px rgba(255, 138, 0, 0.15);
        }

        .sidebar-filter-box {
          padding: 16px 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
          margin-top: 12px;
        }
        .sidebar-filter-heading {
          font-size: 0.7rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; margin-bottom: 14px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .filter-group { margin-bottom: 14px; }
        .filter-group label { display: block; font-size: 0.74rem; color: #cbd5e1; font-weight: 600; margin-bottom: 6px; }
        .filter-group select {
          width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.7);
          border: 1px solid #334155; border-radius: 8px; color: #f8fafc;
          font-size: 0.83rem; outline: none; cursor: pointer;
        }
        .btn-reset-filters {
          background: transparent; border: none; color: #f87171;
          font-size: 0.7rem; cursor: pointer; font-weight: 700; text-decoration: underline;
        }

        .sidebar-logout-wrap {
          flex-shrink: 0; padding: 16px 20px 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
        }
        .logout-btn {
          width: 100%; padding: 12px; background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
          font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* ============ 2. MAIN CONTENT SPLIT (TOP FIXED + BOTTOM SCROLL) ============ */
        .main-content-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          width: calc(100% - 290px);
        }

        /* 🔒 TOP FIXED SECTION */
        .fixed-top-section {
          flex-shrink: 0;
          background: #f1f5f9;
          padding: 24px 32px 14px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          z-index: 20;
        }

        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; flex-wrap: wrap; gap: 14px;
        }
        .page-title { margin: 0; color: #0f172a; font-size: 1.45rem; font-weight: 800; }
        .page-breadcrumb {
          font-size: 0.82rem; color: #64748b; margin-top: 4px;
          display: flex; align-items: center; gap: 8px;
        }
        .role-chip {
          display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px;
          border-radius: 999px; font-size: 0.75rem; font-weight: 800;
        }
        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-add-business, .btn-add-booking {
          padding: 9px 16px; border-radius: 10px; border: none; font-weight: 700;
          cursor: pointer; font-size: 0.86rem; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-add-business { background: linear-gradient(135deg, #ff8a00, #f97316); color: #fff; }
        .btn-add-booking { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; }

        .top-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 14px;
        }
        .stat-card {
          background: #ffffff; padding: 14px 18px; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;
          display: flex; align-items: center; gap: 14px;
        }
        .stat-icon-wrap {
          width: 44px; height: 44px; display: grid; place-items: center;
          border-radius: 10px; font-size: 1.3rem; flex-shrink: 0;
        }
        .stat-card-text { display: flex; flex-direction: column; }
        .stat-title { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0; }
        .stat-val { font-size: 1.6rem; font-weight: 900; margin: 2px 0 0; color: #0f172a; line-height: 1; }

        .chart-toggle-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: #ffffff; padding: 10px 18px; border-radius: 12px;
          border: 1px solid #e2e8f0; margin-bottom: 4px;
        }
        .chart-toggle-btn {
          padding: 7px 16px; border-radius: 8px; border: none;
          background: #0284c7; color: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer;
        }
        .chart-card-wrapper {
          max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
        }
        .chart-card-wrapper.open { max-height: 380px; margin-top: 10px; }
        .chart-card {
          background: #ffffff; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0;
        }

        /* 📜 SCROLLABLE BOTTOM CONTENT */
        .scrollable-body-section {
          flex: 1;
          overflow-y: auto;
          padding: 18px 32px 40px;
        }

        /* ============ HORIZONTAL SLIDER STRIP ============ */
        .slider-section-wrap {
          display: flex; align-items: center; margin-bottom: 16px;
          background: #ffffff; padding: 10px 14px; border-radius: 14px;
          border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .slider-scroll-btn {
          width: 30px; height: 30px; border-radius: 50%; border: 1px solid #cbd5e1;
          background: #f8fafc; color: #334155; font-size: 0.8rem; cursor: pointer;
          display: grid; place-items: center; flex-shrink: 0; transition: all 0.2s ease;
        }
        .slider-scroll-btn:hover { background: #0284c7; color: #fff; border-color: #0284c7; }
        .inquiry-slider-track {
          display: flex; align-items: center; gap: 10px; overflow-x: auto;
          scroll-behavior: smooth; padding: 2px 10px; scrollbar-width: none; flex: 1;
        }
        .inquiry-slider-track::-webkit-scrollbar { display: none; }
        .slider-item-card {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 999px; background: #f8fafc; border: 1.5px solid #e2e8f0;
          color: #475569; font-size: 0.84rem; font-weight: 700; cursor: pointer;
          white-space: nowrap; transition: all 0.2s ease;
        }
        .slider-item-card:hover { border-color: #0284c7; color: #0284c7; background: #f0f9ff; }
        .slider-item-card.active {
          background: #0284c7; border-color: #0284c7; color: #ffffff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }
        .slider-badge {
          padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 800;
          background: #e2e8f0; color: #334155;
        }
        .slider-item-card.active .slider-badge { background: rgba(255, 255, 255, 0.25); color: #ffffff; }

        .search-bar-wrap { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
        .search-input {
          max-width: 420px; flex: 1; padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid #cbd5e1; font-size: 0.9rem; background: #ffffff; color: #0f172a;
        }
        .search-btn {
          padding: 10px 20px; border-radius: 10px; border: none;
          background: #0f172a; color: #fff; cursor: pointer; font-weight: 700;
        }

        /* ============ TABLE ============ */
        .table-container {
          background: #ffffff; border-radius: 14px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;
          overflow-x: auto;
        }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
        .admin-table th {
          background: #f8fafc; color: #475569; padding: 13px 16px; font-weight: 800;
          border-bottom: 1.5px solid #e2e8f0; font-size: 0.76rem; text-transform: uppercase;
        }
        .admin-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        .contact-link { color: #0284c7; text-decoration: none; font-weight: 600; }
        .service-tag {
          background: #e0f2fe; color: #0369a1; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-block;
        }
        .service-tag-warn {
          background: #fef3c7; color: #92400e; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-block;
        }
        .service-tag-draft {
          background: #fee2e2; color: #b91c1c; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-block;
        }

        .admin-action-btn {
          padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 4px;
        }
        .btn-view { background: #e0f2fe; color: #0369a1; margin-right: 6px; }
        .btn-delete { background: #fee2e2; color: #dc2626; }
        .btn-approve { background: #dcfce7; color: #15803d; margin-right: 6px; }
        .btn-reject { background: #fef3c7; color: #b45309; margin-right: 6px; }

        /* ============ PAGINATION BAR (30 PER PAGE) ============ */
        .pagination-bar {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; margin-top: 16px; padding: 12px 16px;
          background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;
        }
        .pagination-info { font-size: 0.85rem; color: #64748b; font-weight: 600; }
        .pagination-actions { display: flex; gap: 6px; align-items: center; }
        .page-btn {
          padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1;
          background: #ffffff; color: #334155; font-size: 0.84rem; font-weight: 700; cursor: pointer;
        }
        .page-btn:hover:not(:disabled) { border-color: #0284c7; color: #0284c7; background: #f0f9ff; }
        .page-btn.active { background: #0284c7; border-color: #0284c7; color: #ffffff; }
        .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ============ 3. INQUIRY POP-UP MODAL (LEFT-ALIGNED, NAME ON TOP) ============ */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 9999; padding: 1rem;
        }
        .modal-box-left {
          background: #ffffff; width: 100%; max-width: 580px; border-radius: 18px;
          padding: 28px 32px; position: relative; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;
          text-align: left;
        }
        .modal-close {
          position: absolute; top: 18px; right: 18px; background: #f1f5f9;
          border: none; border-radius: 50%; width: 34px; height: 34px;
          cursor: pointer; font-weight: 700; color: #64748b;
        }
        .modal-close:hover { background: #fee2e2; color: #ef4444; }

        .modal-customer-name-hero {
          margin: 0 0 6px; font-size: 1.6rem; font-weight: 900;
          color: #0f172a; text-align: left;
        }
        .modal-customer-sub {
          margin: 0 0 20px; font-size: 0.86rem; color: #64748b;
          font-weight: 600; text-align: left;
        }

        .modal-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          background: #f8fafc; padding: 16px; border-radius: 12px;
          border: 1px solid #e2e8f0; margin-bottom: 20px; text-align: left;
        }
        .modal-info-item strong {
          display: block; font-size: 0.72rem; color: #64748b;
          text-transform: uppercase; margin-bottom: 3px;
        }
        .modal-info-item span, .modal-info-item a {
          font-size: 0.95rem; color: #0f172a; font-weight: 700; text-decoration: none;
        }

        .modal-message-section {
          text-align: left; margin-bottom: 24px;
        }
        .modal-message-section strong {
          display: block; font-size: 0.78rem; color: #64748b;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .modal-message-box {
          background: #f8fafc; padding: 14px 16px; border-radius: 10px;
          border: 1px solid #e2e8f0; color: #1e293b; font-size: 0.95rem;
          line-height: 1.6; text-align: left;
        }

        .modal-bottom-actions {
          display: flex; gap: 10px; justify-content: flex-start;
          padding-top: 16px; border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 1200px) {
          .top-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .admin-root { flex-direction: column; overflow-y: auto; height: auto; }
          .sidebar { width: 100%; height: auto; }
          .main-content-layout { width: 100%; height: auto; overflow: visible; }
          .fixed-top-section { position: relative; padding: 16px; }
          .scrollable-body-section { padding: 16px; }
          .top-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ============ 1. FIXED LEFT SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <div className="sidebar-header">
            <div className="sidebar-brand-wrap">
              <img src={logo} alt="Chintu AC Cool Care" className="sidebar-logo" />
              <div className="sidebar-brand-text">
                <h2 className="sidebar-brand">Chintu Cool AC</h2>
                <div className="sidebar-sub">Admin Control Portal</div>
              </div>
            </div>
          </div>

          <div
            className="sidebar-role-indicator"
            style={{
              background: currentRoleBadge.bg,
              color: currentRoleBadge.text,
              border: `1px solid ${currentRoleBadge.border}`
            }}
          >
            <span>{currentRoleBadge.label}</span>
          </div>

          <div className="sidebar-nav">
            {canAccess('inquiries') && (
              <button
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Inquiries & Analytics
              </button>
            )}
            {canAccess('businesses') && (
              <button
                className={`nav-btn ${activeTab === 'businesses' ? 'active' : ''}`}
                onClick={() => setActiveTab('businesses')}
              >
                🏢 Business Management
              </button>
            )}
            {canAccess('blogs') && (
              <button
                className={`nav-btn ${activeTab === 'blogs' ? 'active' : ''}`}
                onClick={() => setActiveTab('blogs')}
              >
                📝 Blog Management
              </button>
            )}
            {canAccess('comments') && (
              <button
                className={`nav-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                💬 Comments
              </button>
            )}
            {canAccess('subscribers') && (
              <button
                className={`nav-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribers')}
              >
                📬 Subscribers
              </button>
            )}
            {canAccess('reports') && (
              <button
                className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📈 Graph Reports
              </button>
            )}
          </div>

          {(canAccess('inquiries') || canAccess('businesses')) && (
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
                <label>State</label>
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
                <label>City</label>
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
          )}
        </div>

        <div className="sidebar-logout-wrap">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ============ 2. MAIN CONTENT AREA ============ */}
      <div className="main-content-layout">
        {/* 🔒 FIXED TOP SECTION (Analytics & Top Stats) */}
        <section className="fixed-top-section">
          <div className="page-header">
            <div>
              <h2 className="page-title">
                {activeTab === 'dashboard' && '📋 Customer Inquiries & Leads'}
                {activeTab === 'businesses' && '🏢 Registered Businesses'}
                {activeTab === 'blogs' && '📝 Blog & Article Approvals'}
                {activeTab === 'comments' && '💬 Comment Moderation'}
                {activeTab === 'subscribers' && '📬 Newsletter Subscribers'}
                {activeTab === 'reports' && '📈 Graph Reports & Analytics'}
              </h2>
              <div className="page-breadcrumb">
                Chintu AC Portal /{' '}
                <span
                  className="role-chip"
                  style={{
                    background: currentRoleBadge.bg,
                    color: currentRoleBadge.text,
                    border: `1px solid ${currentRoleBadge.border}`
                  }}
                >
                  {currentRoleBadge.label}
                </span>
                <span>· <strong>{activeTab.toUpperCase()}</strong></span>
              </div>
            </div>

            <div className="header-actions">
              {activeTab === 'businesses' && (
                <>
                  <button className="btn-add-business" onClick={() => setIsUploadModalOpen(true)}>
                    📥 Upload Excel
                  </button>
                  <button className="btn-add-business" onClick={() => setIsBusinessModalOpen(true)}>
                    + Add Business
                  </button>
                </>
              )}
              {activeTab === 'dashboard' && (
                <button className="btn-add-booking" onClick={() => setIsAddModalOpen(true)}>
                  + Add Booking
                </button>
              )}
              {activeTab === 'blogs' && (
                <button
                  className="btn-add-booking"
                  onClick={() => {
                    setEditingBlog(null);
                    setNewBlog({
                      title: '',
                      slug: '',
                      category: 'AC Repair',
                      author: '',
                      excerpt: '',
                      content: '',
                      imageUrl: '',
                      galleryImages: [],
                      status: 'Draft'
                    });
                    setIsBlogModalOpen(true);
                  }}
                >
                  + Add Blog
                </button>
              )}
              {activeTab === 'subscribers' && (
                <button className="btn-add-business" onClick={exportSubscribersCSV}>
                  ⬇ Export CSV
                </button>
              )}
            </div>
          </div>

          {actionStatus && (
            <div className="action-toast">
              <span>✅</span>
              <span>{actionStatus}</span>
            </div>
          )}

          {/* 4 DYNAMIC LIVE METRIC CARDS (FIXED AT TOP) */}
          {canAccess('inquiries') && (
            <div className="top-stats-grid">
              {statCards.map((card) => (
                <div key={card.key} className="stat-card" style={{ borderTop: `4px solid ${card.color}` }}>
                  <div className="stat-icon-wrap" style={{ background: card.bg }}>
                    {card.icon}
                  </div>
                  <div className="stat-card-text">
                    <p className="stat-title">{card.label}</p>
                    <p className="stat-val">{stats[card.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ANALYTICS OVERVIEW TOGGLE BAR (FIXED AT TOP) */}
          {activeTab === 'dashboard' && (
            <>
              <div className="chart-toggle-bar">
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  📈 Analytics Overview & Booking Flow
                </span>
                <button
                  className="chart-toggle-btn"
                  onClick={() => setShowChart(!showChart)}
                >
                  {showChart ? '▲ Hide Graph' : '▼ Show Graph'}
                </button>
              </div>

              <div className={`chart-card-wrapper ${showChart ? 'open' : ''}`}>
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Lead Inquiries Trend</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['day', 'month', 'year'].map((item) => (
                        <button
                          key={item}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: range === item ? '#0284c7' : '#e2e8f0',
                            color: range === item ? '#fff' : '#475569',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                          onClick={() => setRange(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: '200px' }}>
                    {chartData.labels.length > 0 ? (
                      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#64748b' }}>Loading analytics...</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 📜 SCROLLABLE BOTTOM CONTENT (Slider + Inquiries 30 Per Page) */}
        <div className="scrollable-body-section">
          {activeTab === 'dashboard' && (
            <>
              {/* HORIZONTAL QUICK SLIDER STRIP */}
              <div className="slider-section-wrap">
                <button className="slider-scroll-btn" onClick={() => handleScrollSlider(-220)} title="Scroll Left">
                  ◀
                </button>

                <div className="inquiry-slider-track" ref={sliderRef}>
                  {[
                    { id: 'All', label: 'All Inquiries', icon: '📋' },
                    { id: 'Pending', label: 'Pending Response', icon: '⏳' },
                    { id: 'In Progress', label: 'In Progress', icon: '🔄' },
                    { id: 'Resolved', label: 'Resolved Tickets', icon: '✅' },
                    { id: 'Cancelled', label: 'Cancelled / Spam', icon: '❌' }
                  ].map((slide) => {
                    const count =
                      slide.id === 'All'
                        ? inquiries.length
                        : inquiries.filter((x) => x.status === slide.id).length;

                    return (
                      <button
                        key={slide.id}
                        type="button"
                        className={`slider-item-card ${inquiryQuickFilter === slide.id ? 'active' : ''}`}
                        onClick={() => {
                          setInquiryQuickFilter(slide.id);
                          setCurrentPage(1);
                        }}
                      >
                        <span>{slide.icon}</span>
                        <span>{slide.label}</span>
                        <span className="slider-badge">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <button className="slider-scroll-btn" onClick={() => handleScrollSlider(220)} title="Scroll Right">
                  ▶
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="search-bar-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search Inquiries (Customer Name, Mobile, City)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="search-btn" onClick={fetchInquiries}>Search</button>
              </div>

              {/* INQUIRIES TABLE (30 RECORDS PER PAGE) */}
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer Name</th>
                      <th>Mobile Number</th>
                      <th>State</th>
                      <th>City</th>
                      <th>Service Category</th>
                      <th>Live Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInquiries.length > 0 ? (
                      paginatedInquiries.map((inq) => (
                        <tr key={inq._id}>
                          <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                          <td><strong>{inq.name}</strong></td>
                          <td>
                            <a href={`tel:${inq.mobile}`} className="contact-link">📞 {inq.mobile}</a>
                          </td>
                          <td>{inq.state || 'Delhi (NCT)'}</td>
                          <td>{inq.city}</td>
                          <td><span className="service-tag">{inq.serviceType}</span></td>
                          <td>
                            <select
                              value={inq.status || 'Pending'}
                              onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                border: '1px solid #cbd5e1'
                              }}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="In Progress">🔄 In Progress</option>
                              <option value="Resolved">✅ Resolved</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            {/* ✅ VIEW BUTTON TRIGGERS CLEAN POP-UP MODAL */}
                            <button
                              className="admin-action-btn btn-view"
                              onClick={() => setViewItem(inq)}
                            >
                              👁 View
                            </button>
                            <button
                              className="admin-action-btn btn-delete"
                              onClick={() => handleDelete(inq._id)}
                            >
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No inquiries found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS (30 PER PAGE) */}
              {filteredInquiries.length > itemsPerPage && (
                <div className="pagination-bar">
                  <div className="pagination-info">
                    Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -{' '}
                    <strong>{Math.min(currentPage * itemsPerPage, filteredInquiries.length)}</strong> of{' '}
                    <strong>{filteredInquiries.length}</strong> inquiries
                  </div>
                  <div className="pagination-actions">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ◀ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                        return (
                          <button
                            key={p}
                            className={`page-btn ${currentPage === p ? 'active' : ''}`}
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === currentPage - 3 || p === currentPage + 3) {
                        return <span key={p} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>;
                      }
                      return null;
                    })}
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              )}
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
                <button className="search-btn" onClick={fetchBusinesses}>Search</button>
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
                      businesses.map((biz) => (
                        <tr key={biz._id}>
                          <td><strong>{biz.businessName}</strong></td>
                          <td>{biz.ownerName}</td>
                          <td>{biz.state || 'Delhi (NCT)'}</td>
                          <td>{biz.city}</td>
                          <td><a href={`tel:${biz.phone}`} className="contact-link">📞 {biz.phone}</a></td>
                          <td><span className="service-tag-warn">{biz.serviceCategory}</span></td>
                          <td>
                            <select
                              value={biz.status || 'Active'}
                              onChange={(e) => handleBusinessStatusChange(biz._id, e.target.value)}
                            >
                              <option value="Active">✅ Active</option>
                              <option value="Pending">🕒 Pending review</option>
                              <option value="Inactive">⏳ Inactive</option>
                              <option value="Suspended">❌ Suspended</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No registered businesses found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ============ TAB 3: BLOGS ============ */}
          {activeTab === 'blogs' && (
            <>
              <div className="search-bar-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search blogs by title, author or category..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                />
                <button className="search-btn" onClick={fetchBlogs}>Search</button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  className={`page-btn ${blogStatusFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setBlogStatusFilter('All')}
                >
                  All Articles ({blogs.length})
                </button>
                <button
                  className={`page-btn ${blogStatusFilter === 'Draft' ? 'active' : ''}`}
                  onClick={() => setBlogStatusFilter('Draft')}
                  style={{ background: blogStatusFilter === 'Draft' ? '#ea580c' : '#fff', color: blogStatusFilter === 'Draft' ? '#fff' : '#c2410c' }}
                >
                  Pending Review (Drafts)
                </button>
                <button
                  className={`page-btn ${blogStatusFilter === 'Published' ? 'active' : ''}`}
                  onClick={() => setBlogStatusFilter('Published')}
                  style={{ background: blogStatusFilter === 'Published' ? '#16a34a' : '#fff', color: blogStatusFilter === 'Published' ? '#fff' : '#15803d' }}
                >
                  Live Published
                </button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Photos</th>
                      <th>Date</th>
                      <th>Approval / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.length > 0 ? (
                      blogs.map((b) => (
                        <tr key={b._id}>
                          <td>
                            {b.imageUrl ? (
                              <img
                                src={getImageUrl(b.imageUrl)}
                                alt=""
                                style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }}
                              />
                            ) : (
                              <div style={{ width: 60, height: 40, background: '#e0f2fe', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                                📝
                              </div>
                            )}
                          </td>
                          <td><strong>{b.title}</strong></td>
                          <td><span className="service-tag">{b.category}</span></td>
                          <td>{b.author}</td>
                          <td>
                            <span className={b.status === 'Published' ? 'service-tag' : 'service-tag-draft'}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.galleryImages?.length > 0 ? (
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                                📸 {b.galleryImages.length} extra
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                            )}
                          </td>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td>
                            {b.status !== 'Published' ? (
                              <button
                                className="admin-action-btn btn-approve"
                                onClick={() => handleBlogStatusUpdate(b._id, 'Published')}
                              >
                                ✓ Approve
                              </button>
                            ) : (
                              <button
                                className="admin-action-btn btn-reject"
                                onClick={() => handleBlogStatusUpdate(b._id, 'Draft')}
                              >
                                Hide
                              </button>
                            )}
                            <button className="admin-action-btn btn-view" onClick={() => handleEditBlog(b)}>✏ Edit</button>
                            <button className="admin-action-btn btn-delete" onClick={() => handleBlogDelete(b._id)}>🗑</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No blogs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ============ TAB 4: COMMENTS ============ */}
          {activeTab === 'comments' && (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Comment</th>
                    <th>Blog</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.name}</strong></td>
                      <td><a href={`mailto:${c.email}`} className="contact-link">✉ {c.email}</a></td>
                      <td>{c.message}</td>
                      <td>{c.blog?.title || 'Deleted blog'}</td>
                      <td><span className="service-tag">{c.status}</span></td>
                      <td>
                        {c.status !== 'Approved' && (
                          <button className="admin-action-btn btn-approve" onClick={() => handleCommentStatus(c._id, 'Approved')}>✓ Approve</button>
                        )}
                        <button className="admin-action-btn btn-delete" onClick={() => handleCommentDelete(c._id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ============ TAB 5: SUBSCRIBERS ============ */}
          {activeTab === 'subscribers' && (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.email}</strong></td>
                      <td><span className="service-tag">{s.status}</span></td>
                      <td>{s.source}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="admin-action-btn btn-delete" onClick={() => handleSubscriberDelete(s._id)}>🗑 Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ============ TAB 6: REPORTS ============ */}
          {activeTab === 'reports' && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 16px' }}>🥧 Service Distribution</h3>
              <div style={{ height: '340px' }}>
                <Doughnut data={serviceReport} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ 3. INQUIRY POP-UP MODAL (CUSTOMER NAME AT TOP, LEFT-ALIGNED) ============ */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>

            {/* CUSTOMER NAME TOP HERO */}
            <h2 className="modal-customer-name-hero">{viewItem.name}</h2>
            <p className="modal-customer-sub">
              Customer Lead ID: <span style={{ color: '#0284c7' }}>#{viewItem._id.slice(-6).toUpperCase()}</span> · Received On {new Date(viewItem.createdAt).toLocaleString()}
            </p>

            {/* LEFT-ALIGNED METADATA GRID */}
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <strong>Phone Number</strong>
                <a href={`tel:${viewItem.mobile}`} style={{ color: '#0284c7' }}>📞 {viewItem.mobile}</a>
              </div>
              <div className="modal-info-item">
                <strong>Email Address</strong>
                <span>{viewItem.email || 'Not Provided'}</span>
              </div>
              <div className="modal-info-item">
                <strong>Service Requested</strong>
                <span style={{ color: '#0369a1' }}>{viewItem.serviceType}</span>
              </div>
              <div className="modal-info-item">
                <strong>Preferred Date</strong>
                <span>{viewItem.date ? new Date(viewItem.date).toLocaleDateString() : 'Immediate Visit'}</span>
              </div>
              <div className="modal-info-item" style={{ gridColumn: 'span 2' }}>
                <strong>Location</strong>
                <span>📍 {viewItem.city}, {viewItem.state || 'Delhi (NCT)'}</span>
              </div>
            </div>

            {/* ISSUE / MESSAGE DESCRIPTION (LEFT-ALIGNED) */}
            <div className="modal-message-section">
              <strong>Appliance Problem & Customer Message</strong>
              <div className="modal-message-box">
                {viewItem.message || 'No specific issue details entered.'}
              </div>
            </div>

            {/* QUICK STATUS ACTIONS (LEFT-ALIGNED) */}
            <div className="modal-bottom-actions">
              <button
                type="button"
                className="admin-action-btn btn-approve"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleStatusChange(viewItem._id, 'Resolved')}
              >
                ✓ Mark Resolved
              </button>
              <button
                type="button"
                className="admin-action-btn btn-reject"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleStatusChange(viewItem._id, 'Pending')}
              >
                ⏳ Mark Pending
              </button>
              <button
                type="button"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setViewItem(null)}
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD BOOKING MODAL ============ */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px' }}>📝 Add Manual Customer Booking</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Customer Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newInquiry.name} onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Mobile Number *</label>
                <input
                  type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newInquiry.mobile} onChange={(e) => setNewInquiry({ ...newInquiry, mobile: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Service Category</label>
                <select
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                  value={newInquiry.serviceType} onChange={(e) => setNewInquiry({ ...newInquiry, serviceType: e.target.value })}
                >
                  {APPLIANCE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Problem Description *</label>
                <textarea
                  rows="3" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newInquiry.message} onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-add-booking" style={{ width: '100%', justifyContent: 'center' }}>
                💾 Save Customer Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ REGISTER BUSINESS MODAL ============ */}
      {isBusinessModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBusinessModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBusinessModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px' }}>🏢 Register New Business Vendor</h3>
            <form onSubmit={handleBusinessSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Business Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBusiness.businessName} onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Owner Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBusiness.ownerName} onChange={(e) => setNewBusiness({ ...newBusiness, ownerName: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Phone *</label>
                <input
                  type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBusiness.phone} onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-add-business" style={{ width: '100%', justifyContent: 'center' }}>
                🚀 Save Business Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ BLOG EDIT / CREATE MODAL ============ */}
      {isBlogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBlogModalOpen(false)}>
          <div className="modal-box-left" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBlogModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px' }}>{editingBlog ? '✏ Edit Article' : '📝 Create Article'}</h3>
            <form onSubmit={handleBlogSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Title *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Author *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBlog.author} onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Cover Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage && <small style={{ color: '#0284c7' }}>Uploading...</small>}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Content *</label>
                <textarea
                  rows="6" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={newBlog.content} onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-add-booking" style={{ width: '100%', justifyContent: 'center' }}>
                💾 {editingBlog ? 'Update Article' : 'Save Article'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ EXCEL IMPORT MODAL ============ */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsUploadModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px' }}>📥 Import Businesses from Excel</h3>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
            <div style={{ marginTop: '10px' }}>
              <button type="button" onClick={downloadSampleExcel} style={{ cursor: 'pointer', padding: '6px 12px' }}>
                ⬇ Download Template
              </button>
            </div>
            {uploadError && <p style={{ color: '#ef4444' }}>{uploadError}</p>}
            <button
              type="button"
              className="btn-add-business"
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
              onClick={handleExcelUpload}
              disabled={isUploading || !uploadFile}
            >
              {isUploading ? 'Importing...' : '🚀 Import Excel Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}