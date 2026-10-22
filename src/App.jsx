import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';

// 📰 Blog Pages Imports
import BlogIndex from './pages/BlogIndex';
import BlogDetail from './pages/BlogDetail';
import BlogSubmit from './pages/BlogSubmit';
import Partners from './pages/Partners';

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