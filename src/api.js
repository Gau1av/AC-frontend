// src/api.js
import axios from 'axios';

// ---------- Base URL Setup ----------
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.trim().replace(/\/+$/, '');

// ---------- Axios Instance ----------
const API = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
});

// ---------- Request Interceptor ----------
API.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // URL path normalization
    if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
      config.url = `/${config.url}`;
    }

    const token = localStorage.getItem('adminToken');
    const isAdminRoute =
      config.url?.includes('/api/admin') ||
      config.url?.includes('/api/newsletter/admin');

    if (token && isAdminRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData multipart boundary preservation
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (import.meta.env.DEV) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${baseURL}${config.url}`,
        {
          hasToken: !!token,
          isAdmin: isAdminRoute,
          isFormData: config.data instanceof FormData,
        }
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor ----------
API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} [${response.status}]`
      );
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    if (error.response) {
      console.error(
        `❌ API Error [${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ''}${error.config?.url}`,
        {
          data: error.response.data,
        }
      );
    } else if (error.request) {
      console.error('❌ Network Error — no response from server', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else {
      console.error('❌ Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ---------- Helper: Get full image URL (Supports Base64, External, & Relative uploads) ----------
export const getImageUrl = (path) => {
  if (!path) return '';
  // Data URIs (Base64), Blob URLs, and external HTTP/HTTPS links should not be prefixed
  if (
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseURL}/${cleanPath}`;
};

// ---------- Helper: Build query string ----------
export const buildQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};

export default API;