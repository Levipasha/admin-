import axios from 'axios';

// API Configuration
const DEFAULT_PROD_API_URL = 'http://127.0.0.1:5000/api';

const normalizeApiBaseUrl = (url) => {
  if (!url) return url;
  const trimmed = String(url).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveApiBaseUrl = () => {
  const envBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : '';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const envPointsToLocal =
    typeof envBaseUrl === 'string' &&
    (envBaseUrl.includes('localhost') || envBaseUrl.includes('127.0.0.1'));

  if (envBaseUrl && !(envPointsToLocal && !isLocalHost)) {
    return envBaseUrl;
  }

  if (isBrowser && !isLocalHost) {
    return normalizeApiBaseUrl(DEFAULT_PROD_API_URL);
  }

  return 'http://127.0.0.1:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Auth API
export const authAPI = {
  login: async (firebaseToken) => {
    const response = await api.post('/auth/login', {}, {
      headers: { Authorization: `Bearer ${firebaseToken}` }
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (firebaseToken) => {
    const response = await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${firebaseToken}` }
    });
    return response.data;
  },

  // Admin OTP Authentication
  requestAdminOTP: async (username) => {
    const response = await api.post('/auth/admin/request-otp', { username });
    return response.data;
  },

  verifyAdminOTP: async (username, otp) => {
    const response = await api.post('/auth/admin/verify-otp', { username, otp });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  getEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Gallery
  getGallery: async (params = {}) => {
    const response = await api.get('/admin/gallery', { params });
    return response.data;
  },

  createGalleryItem: async (payload) => {
    const response = await api.post('/admin/gallery', payload);
    return response.data;
  },

  updateGalleryItem: async (id, payload) => {
    const response = await api.put(`/admin/gallery/${id}`, payload);
    return response.data;
  },

  deleteGalleryItem: async (id) => {
    const response = await api.delete(`/admin/gallery/${id}`);
    return response.data;
  },

  uploadGalleryImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadEventImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/events/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Artists
  getArtists: async (params = {}) => {
    const response = await api.get('/admin/artists', { params });
    return response.data;
  },
  createArtist: async (payload) => {
    const response = await api.post('/admin/artists', payload);
    return response.data;
  },
  updateArtist: async (id, payload) => {
    const response = await api.put(`/admin/artists/${id}`, payload);
    return response.data;
  },
  deleteArtist: async (id) => {
    const response = await api.delete(`/admin/artists/${id}`);
    return response.data;
  },
  uploadArtistImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/artists/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default api;
