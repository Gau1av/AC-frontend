import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Core Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import Partners from './pages/Partners';

// Blog Pages
import BlogIndex from './pages/BlogIndex';
import BlogDetail from './pages/BlogDetail';
import BlogSubmit from './pages/BlogSubmit';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

// Automatically scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/partners" element={<Partners />} />

        {/* Blog Routes */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/write" element={<BlogSubmit />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}