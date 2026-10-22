// src/pages/WriteBlog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { compressImage } from '../utils/compressImage';

export default function WriteBlog() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'AC Repair',
    excerpt: '',
    content: ''
  });

  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]); // Up to 2 extra images
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Single Cover Image Upload with Auto-Compress
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError('');
    try {
      const compressed = await compressImage(file, 1200, 0.8);
      setCoverImage(compressed);
    } catch (err) {
      setError('Cover image compression failed: ' + err.message);
    } finally {
      setCompressing(false);
    }
  };

  // 2. Additional 1-2 Supporting Images Upload with Auto-Compress
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (galleryImages.length + files.length > 2) {
      setError('Aap maximum 2 additional pictures hi upload kar sakte hain.');
      return;
    }

    setCompressing(true);
    setError('');
    try {
      const compressedBatch = await Promise.all(
        files.map((file) => compressImage(file, 1000, 0.75))
      );
      setGalleryImages((prev) => [...prev, ...compressedBatch]);
    } catch (err) {
      setError('Image compression error: ' + err.message);
    } finally {
      setCompressing(false);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        imageUrl: coverImage,
        galleryImages: galleryImages, // Compressed images array
        status: 'Draft' // Admin approval workflow
      };

      const res = await API.post('/api/blogs/submit', payload);
      if (res.data?.success) {
        setSuccessMsg('Blog successfully submit ho gaya! Admin approval ke baad live ho jayega.');
        setTimeout(() => {
          navigate('/blog');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Blog submit karne me issue aaya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '8px' }}>Write Community Article</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Share your appliance troubleshooting tips with our community.
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold' }}>
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '32px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Article Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. How to Clean Split AC Filter at Home"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Author Name *</label>
            <input
              type="text"
              required
              placeholder="Your name or Business name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
            >
              <option value="AC Repair">AC Repair</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Microwave">Microwave</option>
              <option value="Tips & Tricks">Tips & Tricks</option>
            </select>
          </div>
        </div>

        {/* 1. Primary Cover Photo */}
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Main Cover Photo</label>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px' }}>
            Auto-compresses into crisp WebP format.
          </p>
          <input type="file" accept="image/*" onChange={handleCoverUpload} />
          {coverImage && (
            <div style={{ marginTop: '10px', height: '140px', width: '220px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* 2. Additional 1-2 Supporting Images with Auto-Compress */}
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>
            Additional Supporting Photos (Max 2)
          </label>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px' }}>
            Upload before/after work pictures or diagram illustrations.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={galleryImages.length >= 2 || compressing}
          />

          {compressing && <span style={{ color: '#0284c7', fontSize: '0.85rem', marginLeft: '10px' }}>⚡ Compressing...</span>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            {galleryImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #0284c7' }}>
                <img src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  style={{ position: 'absolute', top: '3px', right: '3px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px', lineHeight: '20px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Article Content *</label>
          <textarea
            required
            rows={9}
            placeholder="Write full article here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', lineHeight: 1.6 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || compressing}
          style={{ width: '100%', padding: '14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit Article for Review'}
        </button>
      </form>
    </div>
  );
}