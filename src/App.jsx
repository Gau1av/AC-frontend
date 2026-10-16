import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';

// 📰 Blog Pages Imports
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />

        {/* Blog Routes */}
        <Route path="/blog" element={<BlogList />} />
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