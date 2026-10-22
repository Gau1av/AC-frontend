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

  /* ---------- INQUIRY STATE ---------- */
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('day');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [viewItem, setViewItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [inquiryQuickFilter, setInquiryQuickFilter] = useState('All');

  /* ---------- BUSINESS STATE ---------- */
  const [businesses, setBusinesses] = useState([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [viewBusiness, setViewBusiness] = useState(null);
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    state: 'Delhi (NCT)',
    city: 'New Delhi',
    serviceCategory: 'AC Services',
    status: 'Active',
    isPaid: false
  });

  const [newInquiry, setNewInquiry] = useState({
    name: '',
    mobile: '',
    email: '',
    state: 'Delhi (NCT)',
    city: 'New Delhi',
    serviceType: 'AC Services',
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

  /* ---------- REPORTS STATE ---------- */
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
        labels: (bizRes.data.data || []).map((d) => d._id),
        datasets: [
          {
            label: `Businesses Registered (${reportRange.toUpperCase()})`,
            data: (bizRes.data.data || []).map((d) => d.count),
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
        labels: (svcRes.data.data || []).map((d) => d._id || 'Other'),
        datasets: [
          {
            label: 'Inquiries by Service',
            data: (svcRes.data.data || []).map((d) => d.count),
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
          prev.map((item) => (item._id === inquiryId ? { ...item, status: newStatus } : item))
        );
        setViewItem((prev) => (prev && prev._id === inquiryId ? { ...prev, status: newStatus } : prev));
        fetchStats();
        setActionStatus(`Status updated to "${newStatus}"!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleBusinessStatusChange = async (bizId, newStatus) => {
    try {
      const res = await API.put(`/api/admin/businesses/${bizId}`, { status: newStatus });
      if (res.data.success) {
        setBusinesses((prev) =>
          prev.map((biz) => (biz._id === bizId ? { ...biz, status: newStatus } : biz))
        );
        setViewBusiness((prev) => (prev && prev._id === bizId ? { ...prev, status: newStatus } : prev));
        fetchStats();
        setActionStatus(`Business status updated to "${newStatus}"!`);
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating business');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer booking?')) return;
    try {
      const res = await API.delete(`/api/admin/inquiries/${id}`);
      if (res.data.success) {
        setInquiries(inquiries.filter((inq) => inq._id !== id));
        if (viewItem?._id === id) setViewItem(null);
        fetchStats();
        fetchAnalytics();
        setActionStatus('Inquiry booking deleted successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting inquiry');
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('Delete this business booking from directory?')) return;
    try {
      const res = await API.delete(`/api/admin/businesses/${id}`);
      if (res.data.success) {
        setBusinesses(businesses.filter((b) => b._id !== id));
        if (viewBusiness?._id === id) setViewBusiness(null);
        fetchStats();
        setActionStatus('Business booking deleted successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting business');
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
          serviceType: 'AC Services',
          date: '',
          message: '',
          status: 'Pending'
        });
        fetchInquiries();
        fetchStats();
        fetchAnalytics();
        setActionStatus('New customer booking added!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add booking');
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
          serviceCategory: 'AC Services',
          status: 'Active',
          isPaid: false
        });
        fetchBusinesses();
        fetchStats();
        setActionStatus('New Business Registered successfully!');
        setTimeout(() => setActionStatus(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register business');
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
      alert(err.response?.data?.message || 'Failed to update blog approval status');
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
        serviceCategory: 'AC Services',
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
    { key: 'totalLead', label: 'Total Lead', color: '#0284c7', icon: '🎯', bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)' },
    { key: 'totalContact', label: 'Total Contact', color: '#8b5cf6', icon: '📞', bg: 'linear-gradient(135deg, #f5f3ff, #ddd6fe)' }
  ];

  /* ---------- FILTERED INQUIRIES ---------- */
  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryQuickFilter === 'All') return true;
    return inq.status === inquiryQuickFilter;
  });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage) || 1;
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredBusinesses = businesses.filter((b) => {
    if (!businessSearch) return true;
    const q = businessSearch.toLowerCase();
    return (
      b.businessName?.toLowerCase().includes(q) ||
      b.ownerName?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q)
    );
  });

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
      <div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#0f172a', fontWeight: 800 }}>
        Checking admin access & permissions…
      </div>
    );
  }

  return (
    <div className="admin-root">
      <style>{`
        * { box-sizing: border-box; text-align: left; }
        html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden; }

        .admin-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
        }

        /* ============ 1. FIXED LEFT SIDEBAR ============ */
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 4px 0 24px rgba(15, 23, 42, 0.2);
          position: sticky;
          top: 0;
          height: 100vh;
          max-height: 100vh;
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
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }

        .sidebar-header {
          padding: 20px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          position: relative;
          flex-shrink: 0;
        }
        .sidebar-header::after {
          content: "";
          position: absolute;
          bottom: 0; left: 18px;
          width: 45px; height: 3px;
          background: linear-gradient(90deg, #ff8a00, #facc15);
          border-radius: 99px;
        }

        .sidebar-brand-wrap { display: flex; align-items: center; gap: 12px; }
        .sidebar-logo {
          width: 46px; height: 46px; aspect-ratio: 1 / 1; object-fit: cover;
          border-radius: 50%; border: 2px solid #ff8a00;
          box-shadow: 0 4px 14px rgba(255, 138, 0, 0.3);
        }
        .sidebar-brand-text { display: flex; flex-direction: column; gap: 2px; }
        .sidebar-brand { font-size: 1.1rem; color: #ff8a00; font-weight: 900; margin: 0; line-height: 1.2; }
        .sidebar-sub { font-size: 0.68rem; color: #cbd5e1; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }

        .sidebar-role-indicator {
          margin: 12px 14px 6px;
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .sidebar-nav { margin-top: 8px; padding: 0 10px; }
        .nav-btn {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 12px 14px; font-size: 0.88rem; border: none; background: transparent;
          color: #cbd5e1; cursor: pointer; text-align: left; font-weight: 700;
          border-radius: 8px; margin-bottom: 4px; transition: all 0.2s ease;
        }
        .nav-btn:hover { background: rgba(255, 255, 255, 0.08); color: #ffffff; }
        .nav-btn.active {
          background: linear-gradient(135deg, rgba(255, 138, 0, 0.22), rgba(250, 204, 21, 0.12));
          color: #ff8a00;
          border-left: 3px solid #ff8a00;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        .sidebar-filter-box {
          padding: 14px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 10px;
        }
        .sidebar-filter-heading {
          font-size: 0.72rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; margin-bottom: 12px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .filter-group { margin-bottom: 12px; text-align: left; }
        .filter-group label { display: block; font-size: 0.72rem; color: #e2e8f0; font-weight: 700; margin-bottom: 4px; text-align: left; }
        .filter-group select {
          width: 100%; padding: 8px 10px; background: #0f172a;
          border: 1.5px solid #334155; border-radius: 8px; color: #f8fafc;
          font-size: 0.82rem; outline: none; cursor: pointer; font-weight: 600; text-align: left;
        }

        /* 🔵 BLUE THEMED SELECT CATEGORY DROPDOWN */
        .select-category-blue {
          background: #eff6ff !important;
          color: #0369a1 !important;
          border: 2px solid #0284c7 !important;
          font-weight: 800 !important;
          outline: none;
          cursor: pointer;
          text-align: left !important;
        }
        .select-category-blue:focus {
          border-color: #0284c7 !important;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.25) !important;
        }
        .select-category-blue option {
          background: #ffffff !important;
          color: #0f172a !important;
          font-weight: 700;
          text-align: left !important;
        }

        .btn-reset-filters {
          background: transparent; border: none; color: #f87171;
          font-size: 0.72rem; cursor: pointer; font-weight: 800; text-decoration: underline;
        }

        .sidebar-logout-wrap {
          flex-shrink: 0; padding: 14px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logout-btn {
          width: 100%; padding: 11px; background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff; border: none; border-radius: 8px; font-weight: 800; cursor: pointer;
          font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* ============ 2. MAIN CONTENT AREA ============ */
        .main-content-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          width: calc(100% - 280px);
          text-align: left;
        }

        /* FIXED TOP SECTION */
        .fixed-top-section {
          flex-shrink: 0;
          background: #ffffff;
          padding: 20px 28px 14px;
          border-bottom: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          z-index: 20;
          text-align: left;
        }

        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
          text-align: left;
        }
        .page-title { margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 900; text-align: left; }
        .page-breadcrumb {
          font-size: 0.82rem; color: #475569; margin-top: 4px;
          display: flex; align-items: center; gap: 8px; font-weight: 600; text-align: left;
        }
        .role-chip {
          display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px;
          border-radius: 999px; font-size: 0.76rem; font-weight: 800;
        }
        .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-add-business, .btn-add-booking {
          padding: 10px 16px; border-radius: 8px; border: none; font-weight: 800;
          cursor: pointer; font-size: 0.86rem; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-add-business { background: #ff8a00; color: #ffffff; box-shadow: 0 4px 12px rgba(255, 138, 0, 0.25); }
        .btn-add-booking { background: #0284c7; color: #ffffff; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }

        .action-toast {
          background: #ecfdf5; color: #065f46; border: 1.5px solid #86efac;
          padding: 8px 14px; border-radius: 8px; margin-bottom: 12px;
          font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
          text-align: left;
        }

        .top-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 12px;
        }
        .stat-card {
          background: #ffffff; padding: 12px 16px; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05); border: 1.5px solid #e2e8f0;
          display: flex; align-items: center; gap: 14px; text-align: left;
        }
        .stat-icon-wrap {
          width: 44px; height: 44px; display: grid; place-items: center;
          border-radius: 10px; font-size: 1.3rem; flex-shrink: 0;
        }
        .stat-card-text { display: flex; flex-direction: column; text-align: left; }
        .stat-title { font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase; margin: 0; text-align: left; }
        .stat-val { font-size: 1.65rem; font-weight: 900; margin: 2px 0 0; color: #0f172a; line-height: 1; text-align: left; }

        .chart-toggle-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: #f8fafc; padding: 10px 16px; border-radius: 10px;
          border: 1px solid #cbd5e1; margin-bottom: 4px;
        }
        .chart-toggle-btn {
          padding: 7px 16px; border-radius: 8px; border: none;
          background: #0284c7; color: #ffffff; font-weight: 800; font-size: 0.82rem; cursor: pointer;
        }
        .chart-card-wrapper {
          max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
        }
        .chart-card-wrapper.open { max-height: 380px; margin-top: 10px; }
        .chart-card {
          background: #ffffff; padding: 16px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0;
        }

        /* SCROLLABLE BODY */
        .scrollable-body-section {
          flex: 1;
          overflow-y: auto;
          padding: 16px 28px 40px;
          text-align: left;
        }

        /* HORIZONTAL SLIDER */
        .slider-section-wrap {
          display: flex; align-items: center; margin-bottom: 16px;
          background: #ffffff; padding: 10px 14px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .slider-scroll-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #cbd5e1;
          background: #f8fafc; color: #0f172a; font-size: 0.85rem; cursor: pointer;
          display: grid; place-items: center; flex-shrink: 0; font-weight: 800;
        }
        .slider-scroll-btn:hover { background: #0284c7; color: #ffffff; border-color: #0284c7; }
        .inquiry-slider-track {
          display: flex; align-items: center; gap: 10px; overflow-x: auto;
          scroll-behavior: smooth; padding: 2px 10px; scrollbar-width: none; flex: 1;
        }
        .inquiry-slider-track::-webkit-scrollbar { display: none; }
        .slider-item-card {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 999px; background: #f8fafc; border: 1.5px solid #cbd5e1;
          color: #334155; font-size: 0.84rem; font-weight: 800; cursor: pointer;
          white-space: nowrap; transition: all 0.2s ease;
        }
        .slider-item-card:hover { border-color: #0284c7; color: #0284c7; background: #f0f9ff; }
        .slider-item-card.active {
          background: #0284c7; border-color: #0284c7; color: #ffffff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }
        .slider-badge {
          padding: 2px 8px; border-radius: 99px; font-size: 0.74rem; font-weight: 900;
          background: #e2e8f0; color: #0f172a;
        }
        .slider-item-card.active .slider-badge { background: rgba(255, 255, 255, 0.28); color: #ffffff; }

        .search-bar-wrap { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
        .search-input {
          max-width: 440px; flex: 1; padding: 11px 16px; border-radius: 10px;
          border: 1.5px solid #cbd5e1; font-size: 0.92rem; background: #ffffff; color: #0f172a;
          outline: none; font-weight: 600; text-align: left;
        }
        .search-input:focus { border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
        .search-btn {
          padding: 11px 22px; border-radius: 10px; border: none;
          background: #0f172a; color: #ffffff; cursor: pointer; font-weight: 800; font-size: 0.88rem;
        }

        /* TABLE - CLEAN LEFT ALIGNED */
        .table-container {
          background: #ffffff; border-radius: 12px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); border: 1.5px solid #e2e8f0;
          overflow-x: auto;
        }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
        .admin-table th {
          background: #f1f5f9; color: #1e293b; padding: 14px 16px; font-weight: 900;
          border-bottom: 2px solid #cbd5e1; font-size: 0.78rem; text-transform: uppercase;
          white-space: nowrap; text-align: left;
        }
        .admin-table td {
          padding: 13px 16px; border-bottom: 1px solid #e2e8f0;
          color: #1e293b; vertical-align: middle; font-weight: 600; text-align: left;
        }
        .admin-table tr:hover { background: #f8fafc; }

        .contact-link { color: #0284c7; text-decoration: none; font-weight: 800; }
        .contact-link:hover { text-decoration: underline; }

        .service-tag {
          background: #e0f2fe; color: #0369a1; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 800; display: inline-block;
          white-space: nowrap; text-align: left;
        }
        .service-tag-warn {
          background: #ffedd5; color: #9a3412; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 800; display: inline-block;
          white-space: nowrap; text-align: left;
        }
        .service-tag-draft {
          background: #fee2e2; color: #b91c1c; padding: 4px 10px;
          border-radius: 6px; font-size: 0.78rem; font-weight: 800; display: inline-block;
          white-space: nowrap; text-align: left;
        }

        .status-select-box {
          padding: 6px 10px; border-radius: 6px; font-weight: 800;
          border: 1.5px solid #cbd5e1; font-size: 0.82rem; background: #ffffff;
          cursor: pointer; outline: none; color: #0f172a; text-align: left;
        }

        .action-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .admin-action-btn {
          padding: 7px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: 800;
          cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 4px;
        }
        .btn-view { background: #e0f2fe; color: #0369a1; }
        .btn-view:hover { background: #0284c7; color: #ffffff; }
        .btn-delete { background: #fee2e2; color: #dc2626; }
        .btn-delete:hover { background: #dc2626; color: #ffffff; }
        .btn-approve { background: #dcfce7; color: #15803d; }
        .btn-reject { background: #fef3c7; color: #b45309; }

        /* PAGINATION */
        .pagination-bar {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; margin-top: 16px; padding: 12px 18px;
          background: #ffffff; border-radius: 10px; border: 1.5px solid #e2e8f0;
          text-align: left;
        }
        .pagination-info { font-size: 0.86rem; color: #334155; font-weight: 700; text-align: left; }
        .pagination-actions { display: flex; gap: 4px; }
        .page-btn {
          padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1;
          background: #ffffff; color: #1e293b; font-size: 0.84rem; font-weight: 800; cursor: pointer;
        }
        .page-btn:hover:not(:disabled) { border-color: #0284c7; color: #0284c7; background: #f0f9ff; }
        .page-btn.active { background: #0284c7; border-color: #0284c7; color: #ffffff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ============ 3. STRICTLY LEFT-ALIGNED VIEW DETAILS MODAL ============ */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 9999; padding: 1rem;
        }
        .modal-box-left {
          background: #ffffff; width: 100%; max-width: 620px; border-radius: 16px;
          padding: 30px 32px; position: relative; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25); border: 1.5px solid #cbd5e1;
          text-align: left !important;
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px; background: #f1f5f9;
          border: none; border-radius: 50%; width: 34px; height: 34px;
          cursor: pointer; font-weight: 900; color: #475569; font-size: 1rem;
        }
        .modal-close:hover { background: #fee2e2; color: #ef4444; }

        /* Customer / Vendor Name at Very Top */
        .modal-customer-name-hero {
          margin: 0 0 4px; font-size: 1.65rem; font-weight: 900;
          color: #0f172a; text-align: left !important; line-height: 1.2;
        }
        .modal-customer-sub {
          margin: 0 0 20px; font-size: 0.84rem; color: #64748b;
          font-weight: 700; text-align: left !important;
        }

        /* Sequential Filled Details Grid */
        .modal-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          background: #f8fafc; padding: 18px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; margin-bottom: 18px; text-align: left !important;
        }
        .modal-info-item { text-align: left !important; }
        .modal-info-item strong {
          display: block; font-size: 0.74rem; color: #475569;
          text-transform: uppercase; margin-bottom: 3px; font-weight: 800; text-align: left !important;
        }
        .modal-info-item span, .modal-info-item a {
          font-size: 0.98rem; color: #0f172a; font-weight: 800; text-decoration: none; text-align: left !important;
        }

        .modal-message-section { text-align: left !important; margin-bottom: 20px; }
        .modal-message-section strong {
          display: block; font-size: 0.76rem; color: #475569;
          text-transform: uppercase; margin-bottom: 6px; font-weight: 800; text-align: left !important;
        }
        .modal-message-box {
          background: #f8fafc; padding: 14px 16px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; color: #0f172a; font-size: 0.95rem;
          line-height: 1.6; text-align: left !important; font-weight: 600;
        }

        .modal-bottom-actions {
          display: flex; gap: 10px; justify-content: flex-start;
          padding-top: 16px; border-top: 1.5px solid #e2e8f0; flex-wrap: wrap; text-align: left !important;
        }

        /* ============ 4. MOBILE VIEW ============ */
        @media (max-width: 1024px) {
          .top-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .admin-root { flex-direction: column; height: auto; min-height: 100vh; overflow-y: auto; }
          .sidebar { width: 100%; height: auto; max-height: none; position: relative; }
          .sidebar-scroll { overflow-y: visible; }
          .main-content-layout { width: 100%; height: auto; overflow: visible; }
          .fixed-top-section { position: relative; padding: 16px 14px; }
          .scrollable-body-section { padding: 14px 12px 30px; }
          .top-stats-grid { grid-template-columns: 1fr; gap: 10px; }
          .page-header { flex-direction: column; align-items: flex-start; }
          .header-actions { width: 100%; }
          .btn-add-business, .btn-add-booking { flex: 1; justify-content: center; }
          .search-bar-wrap { flex-direction: column; }
          .search-input { max-width: 100%; width: 100%; }
          .search-btn { width: 100%; }
          .modal-box-left { padding: 22px 18px; border-radius: 12px; }
          .modal-info-grid { grid-template-columns: 1fr; }
          .admin-table th, .admin-table td { padding: 10px 12px; font-size: 0.82rem; }
        }

        @media (max-width: 480px) {
          .modal-customer-name-hero { font-size: 1.35rem; }
          .modal-bottom-actions { flex-direction: column; }
          .modal-bottom-actions button { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ============ 1. FIXED LEFT SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <div className="sidebar-header">
            <div className="sidebar-brand-wrap">
              <img src={logo} alt="Chintu AC Logo" className="sidebar-logo" />
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
              border: `1.5px solid ${currentRoleBadge.border}`
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
                📋 Customer Bookings
              </button>
            )}
            {canAccess('businesses') && (
              <button
                className={`nav-btn ${activeTab === 'businesses' ? 'active' : ''}`}
                onClick={() => setActiveTab('businesses')}
              >
                🏢 Business Bookings
              </button>
            )}
            {canAccess('blogs') && (
              <button
                className={`nav-btn ${activeTab === 'blogs' ? 'active' : ''}`}
                onClick={() => setActiveTab('blogs')}
              >
                📝 Blog Articles
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
                📈 Reports & Graphs
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
                <label>Operating State</label>
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
                <label>Operating City</label>
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

              {/* 🔵 BLUE THEMED APPLIANCE SELECT CATEGORY DROPDOWN */}
              <div className="filter-group">
                <label style={{ color: '#38bdf8' }}>Select Category</label>
                <select
                  className="select-category-blue"
                  value={sidebarFilters.service}
                  onChange={(e) => setSidebarFilters({ ...sidebarFilters, service: e.target.value })}
                >
                  <option value="All">All Categories</option>
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
            🚪 Logout Portal
          </button>
        </div>
      </aside>

      {/* ============ 2. MAIN CONTENT AREA ============ */}
      <div className="main-content-layout">
        <section className="fixed-top-section">
          <div className="page-header">
            <div>
              <h2 className="page-title">
                {activeTab === 'dashboard' && '📋 Customer Inquiries & Leads'}
                {activeTab === 'businesses' && '🏢 Registered Businesses & Vendors'}
                {activeTab === 'blogs' && '📝 Blog & Article Approvals'}
                {activeTab === 'comments' && '💬 Comment Moderation'}
                {activeTab === 'subscribers' && '📬 Newsletter Subscribers'}
                {activeTab === 'reports' && '📈 Graph Reports & Analytics'}
              </h2>
              <div className="page-breadcrumb">
                Portal /{' '}
                <span
                  className="role-chip"
                  style={{
                    background: currentRoleBadge.bg,
                    color: currentRoleBadge.text,
                    border: `1.5px solid ${currentRoleBadge.border}`
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
                    📥 Bulk Import Excel
                  </button>
                  <button className="btn-add-booking" onClick={() => setIsBusinessModalOpen(true)}>
                    + Add Business
                  </button>
                </>
              )}
              {activeTab === 'dashboard' && (
                <button className="btn-add-booking" onClick={() => setIsAddModalOpen(true)}>
                  + Add Customer Booking
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
                  ⬇ Export Subscribers
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

          {/* DYNAMIC METRIC STATS */}
          {canAccess('inquiries') && (
            <div className="top-stats-grid">
              {statCards.map((card) => (
                <div key={card.key} className="stat-card" style={{ borderLeft: `5px solid ${card.color}` }}>
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

          {/* ANALYTICS COLLAPSIBLE TOGGLE */}
          {activeTab === 'dashboard' && (
            <>
              <div className="chart-toggle-bar">
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  📈 Booking Volume Trends & Statistics
                </span>
                <button
                  className="chart-toggle-btn"
                  onClick={() => setShowChart(!showChart)}
                >
                  {showChart ? '▲ Hide Graph' : '▼ Show Trend Graph'}
                </button>
              </div>

              <div className={`chart-card-wrapper ${showChart ? 'open' : ''}`}>
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>Lead Trend Timeline</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['day', 'month', 'year'].map((item) => (
                        <button
                          key={item}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: range === item ? '#0284c7' : '#e2e8f0',
                            color: range === item ? '#ffffff' : '#334155',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 800
                          }}
                          onClick={() => setRange(item)}
                        >
                          {item.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: '190px' }}>
                    {chartData.labels.length > 0 ? (
                      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#64748b', fontWeight: 700 }}>
                        Loading analytics…
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* SCROLLABLE BODY */}
        <div className="scrollable-body-section">
          {/* ============ TAB 1: CUSTOMER INQUIRIES ============ */}
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
                    { id: 'Cancelled', label: 'Cancelled', icon: '❌' }
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

              {/* SEARCH */}
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

              {/* TABLE */}
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Booking Date</th>
                      <th>Customer Name</th>
                      <th>Mobile Number</th>
                      <th>Location</th>
                      <th>Service Category</th>
                      <th>Live Status</th>
                      <th>Action Buttons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInquiries.length > 0 ? (
                      paginatedInquiries.map((inq) => (
                        <tr key={inq._id}>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(inq.createdAt).toLocaleDateString()}</td>
                          <td><strong style={{ color: '#0f172a' }}>{inq.name}</strong></td>
                          <td>
                            <a href={`tel:${inq.mobile}`} className="contact-link">📞 {inq.mobile}</a>
                          </td>
                          <td>{inq.city}, {inq.state || 'Delhi (NCT)'}</td>
                          <td><span className="service-tag">{inq.serviceType}</span></td>
                          <td>
                            <select
                              value={inq.status || 'Pending'}
                              onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                              className="status-select-box"
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="In Progress">🔄 In Progress</option>
                              <option value="Resolved">✅ Resolved</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-btn-group">
                              <button
                                className="admin-action-btn btn-view"
                                onClick={() => setViewItem(inq)}
                              >
                                👁 View Details
                              </button>
                              <button
                                className="admin-action-btn btn-delete"
                                onClick={() => handleDelete(inq._id)}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No customer bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
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

          {/* ============ TAB 2: BUSINESS BOOKINGS ============ */}
          {activeTab === 'businesses' && (
            <>
              <div className="search-bar-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search Business Agency, Owner, Phone or City..."
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                />
                <button className="search-btn" onClick={fetchBusinesses}>Search</button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Business Agency</th>
                      <th>Owner / Tech</th>
                      <th>Phone Number</th>
                      <th>Location</th>
                      <th>Service Specialty</th>
                      <th>Payment</th>
                      <th>Live Status</th>
                      <th>Action Buttons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((biz) => (
                        <tr key={biz._id}>
                          <td><strong style={{ color: '#0f172a' }}>{biz.businessName}</strong></td>
                          <td>{biz.ownerName}</td>
                          <td>
                            <a href={`tel:${biz.phone}`} className="contact-link">📞 {biz.phone}</a>
                          </td>
                          <td>{biz.city}, {biz.state || 'Delhi (NCT)'}</td>
                          <td><span className="service-tag-warn">{biz.serviceCategory}</span></td>
                          <td>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                background: biz.isPaid ? '#dcfce7' : '#fee2e2',
                                color: biz.isPaid ? '#15803d' : '#b91c1c'
                              }}
                            >
                              {biz.isPaid ? '✓ Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td>
                            <select
                              value={biz.status || 'Active'}
                              onChange={(e) => handleBusinessStatusChange(biz._id, e.target.value)}
                              className="status-select-box"
                            >
                              <option value="Active">✅ Active</option>
                              <option value="Pending">🕒 Pending</option>
                              <option value="Inactive">⏳ Inactive</option>
                              <option value="Suspended">❌ Suspended</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-btn-group">
                              <button
                                className="admin-action-btn btn-view"
                                onClick={() => setViewBusiness(biz)}
                              >
                                👁 View Details
                              </button>
                              <button
                                className="admin-action-btn btn-delete"
                                onClick={() => handleDeleteBusiness(biz._id)}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No registered business bookings found.</td></tr>
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

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
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
                                style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6 }}
                              />
                            ) : (
                              <div style={{ width: 56, height: 38, background: '#e0f2fe', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                                📝
                              </div>
                            )}
                          </td>
                          <td><strong style={{ color: '#0f172a' }}>{b.title}</strong></td>
                          <td><span className="service-tag">{b.category}</span></td>
                          <td>{b.author}</td>
                          <td>
                            <span className={b.status === 'Published' ? 'service-tag' : 'service-tag-draft'}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.galleryImages?.length > 0 ? (
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7' }}>
                                📸 {b.galleryImages.length} extra
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                            )}
                          </td>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-btn-group">
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
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No blogs found.</td></tr>
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
                      <td><strong style={{ color: '#0f172a' }}>{c.name}</strong></td>
                      <td><a href={`mailto:${c.email}`} className="contact-link">✉ {c.email}</a></td>
                      <td style={{ maxWidth: 320 }}>{c.message}</td>
                      <td>{c.blog?.title || 'Deleted blog'}</td>
                      <td><span className="service-tag">{c.status}</span></td>
                      <td>
                        <div className="action-btn-group">
                          {c.status !== 'Approved' && (
                            <button className="admin-action-btn btn-approve" onClick={() => handleCommentStatus(c._id, 'Approved')}>✓ Approve</button>
                          )}
                          <button className="admin-action-btn btn-delete" onClick={() => handleCommentDelete(c._id)}>🗑</button>
                        </div>
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
                    <th>Subscribed On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((s) => (
                    <tr key={s._id}>
                      <td><strong style={{ color: '#0f172a' }}>{s.email}</strong></td>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              <div className="table-container" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: '#0f172a' }}>📈 Registered Businesses</h3>
                <div style={{ height: '280px' }}>
                  <Line data={businessReport} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="table-container" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: '#0f172a' }}>🥧 Inquiries by Category</h3>
                <div style={{ height: '280px' }}>
                  <Doughnut data={serviceReport} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ 3. STRICTLY LEFT-ALIGNED VIEW DETAILS MODAL (CUSTOMER) ============ */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>

            {/* Customer Name Prominently at the Very Top Left */}
            <h2 className="modal-customer-name-hero">{viewItem.name}</h2>
            <p className="modal-customer-sub">
              Booking Lead ID: <span style={{ color: '#0284c7' }}>#{viewItem._id.slice(-6).toUpperCase()}</span> · Received {new Date(viewItem.createdAt).toLocaleString()}
            </p>

            {/* Filled Details Stacked in Left-Aligned Grid */}
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
                <strong>Service Category</strong>
                <span style={{ color: '#0369a1' }}>{viewItem.serviceType}</span>
              </div>
              <div className="modal-info-item">
                <strong>Preferred Visit Date</strong>
                <span>{viewItem.date ? new Date(viewItem.date).toLocaleDateString() : 'Immediate Visit'}</span>
              </div>
              <div className="modal-info-item" style={{ gridColumn: 'span 2' }}>
                <strong>Customer Location</strong>
                <span>📍 {viewItem.city}, {viewItem.state || 'Delhi (NCT)'}</span>
              </div>
              <div className="modal-info-item" style={{ gridColumn: 'span 2' }}>
                <strong>Current Status</strong>
                <span style={{ color: '#ff8a00' }}>{viewItem.status || 'Pending'}</span>
              </div>
            </div>

            {/* Issue Description Left-Aligned */}
            <div className="modal-message-section">
              <strong>Appliance Problem & Customer Message</strong>
              <div className="modal-message-box">
                {viewItem.message || 'No specific issue details entered.'}
              </div>
            </div>

            {/* Bottom Actions */}
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
                className="admin-action-btn btn-delete"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleDelete(viewItem._id)}
              >
                🗑 Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ 4. STRICTLY LEFT-ALIGNED VIEW DETAILS MODAL (BUSINESS) ============ */}
      {viewBusiness && (
        <div className="modal-overlay" onClick={() => setViewBusiness(null)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewBusiness(null)}>✕</button>

            {/* Business Name at Very Top Left */}
            <h2 className="modal-customer-name-hero">{viewBusiness.businessName}</h2>
            <p className="modal-customer-sub">
              Vendor Profile ID: <span style={{ color: '#ff8a00' }}>#{viewBusiness._id.slice(-6).toUpperCase()}</span> · Registered {new Date(viewBusiness.createdAt).toLocaleString()}
            </p>

            {/* Sequential Filled Details Grid */}
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <strong>Owner / Technician</strong>
                <span>{viewBusiness.ownerName}</span>
              </div>
              <div className="modal-info-item">
                <strong>Contact Phone</strong>
                <a href={`tel:${viewBusiness.phone}`} style={{ color: '#0284c7' }}>📞 {viewBusiness.phone}</a>
              </div>
              <div className="modal-info-item">
                <strong>Service Specialty</strong>
                <span style={{ color: '#c2410c' }}>{viewBusiness.serviceCategory}</span>
              </div>
              <div className="modal-info-item">
                <strong>Payment Status</strong>
                <span style={{ color: viewBusiness.isPaid ? '#15803d' : '#b91c1c' }}>
                  {viewBusiness.isPaid ? '✓ Paid Vendor' : '⚠ Unpaid'}
                </span>
              </div>
              <div className="modal-info-item" style={{ gridColumn: 'span 2' }}>
                <strong>Operating Location</strong>
                <span>📍 {viewBusiness.city}, {viewBusiness.state || 'Delhi (NCT)'}</span>
              </div>
              <div className="modal-info-item" style={{ gridColumn: 'span 2' }}>
                <strong>Listing Status</strong>
                <span style={{ textTransform: 'uppercase' }}>{viewBusiness.status || 'Active'}</span>
              </div>
            </div>

            <div className="modal-bottom-actions">
              <button
                type="button"
                className="admin-action-btn btn-approve"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleBusinessStatusChange(viewBusiness._id, 'Active')}
              >
                ✓ Set Active
              </button>
              <button
                type="button"
                className="admin-action-btn btn-reject"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleBusinessStatusChange(viewBusiness._id, 'Suspended')}
              >
                🚫 Suspend
              </button>
              <button
                type="button"
                className="admin-action-btn btn-delete"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                onClick={() => handleDeleteBusiness(viewBusiness._id)}
              >
                🗑 Delete Business
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: ADD CUSTOMER BOOKING ============ */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', textAlign: 'left' }}>📝 Add Customer Booking</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Customer Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', textAlign: 'left' }}
                  value={newInquiry.name} onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Mobile Number *</label>
                <input
                  type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', textAlign: 'left' }}
                  value={newInquiry.mobile} onChange={(e) => setNewInquiry({ ...newInquiry, mobile: e.target.value })}
                />
              </div>
              {/* 🔵 BLUE THEMED CATEGORY SELECT IN ADD FORM */}
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', color: '#0284c7', textAlign: 'left' }}>Select Category *</label>
                <select
                  className="select-category-blue"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', textAlign: 'left' }}
                  value={newInquiry.serviceType} onChange={(e) => setNewInquiry({ ...newInquiry, serviceType: e.target.value })}
                >
                  {APPLIANCE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Operating City *</label>
                <input
                  type="text" required placeholder="City name"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', textAlign: 'left' }}
                  value={newInquiry.city} onChange={(e) => setNewInquiry({ ...newInquiry, city: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Problem Description *</label>
                <textarea
                  rows="3" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', textAlign: 'left' }}
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

      {/* ============ MODAL: REGISTER BUSINESS ============ */}
      {isBusinessModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBusinessModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBusinessModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', textAlign: 'left' }}>🏢 Register New Business Vendor</h3>
            <form onSubmit={handleBusinessSubmit}>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Business Agency Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBusiness.businessName} onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Owner Name *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBusiness.ownerName} onChange={(e) => setNewBusiness({ ...newBusiness, ownerName: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Contact Phone *</label>
                <input
                  type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBusiness.phone} onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>City *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBusiness.city} onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                />
              </div>
              {/* 🔵 BLUE THEMED CATEGORY SELECT IN BUSINESS FORM */}
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', color: '#0284c7', textAlign: 'left' }}>Select Category</label>
                <select
                  className="select-category-blue"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', textAlign: 'left' }}
                  value={newBusiness.serviceCategory} onChange={(e) => setNewBusiness({ ...newBusiness, serviceCategory: e.target.value })}
                >
                  {APPLIANCE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-add-business" style={{ width: '100%', justifyContent: 'center' }}>
                🚀 Save Business Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL: BLOG EDIT / CREATE ============ */}
      {isBlogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBlogModalOpen(false)}>
          <div className="modal-box-left" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsBlogModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', textAlign: 'left' }}>{editingBlog ? '✏ Edit Article' : '📝 Create Article'}</h3>
            <form onSubmit={handleBlogSubmit}>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Title *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Author *</label>
                <input
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
                  value={newBlog.author} onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Cover Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage && <small style={{ color: '#0284c7' }}>Uploading...</small>}
              </div>
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px', textAlign: 'left' }}>Content *</label>
                <textarea
                  rows="6" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'left' }}
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

      {/* ============ MODAL: EXCEL IMPORT ============ */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-box-left" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsUploadModalOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', textAlign: 'left' }}>📥 Bulk Import Businesses from Excel</h3>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <button type="button" onClick={downloadSampleExcel} style={{ cursor: 'pointer', padding: '6px 12px', fontWeight: 700 }}>
                ⬇ Download Sample Template
              </button>
            </div>
            {uploadError && <p style={{ color: '#ef4444', fontWeight: 700, textAlign: 'left' }}>{uploadError}</p>}
            <button
              type="button"
              className="btn-add-business"
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
              onClick={handleExcelUpload}
              disabled={isUploading || !uploadFile}
            >
              {isUploading ? 'Importing…' : '🚀 Import Excel Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}