import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './theme';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({ 
  baseURL: API_BASE, 
  timeout: 15000 
});

// ─── Attach JWT automatically ─────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Handle 401 globally ──────────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  sendOTP:         (data) => api.post('/auth/send-otp', data),
  register:        (data) => api.post('/auth/register', data),
  loginEmail:      (data) => api.post('/auth/login/email', data),
  loginPhone:      (data) => api.post('/auth/login/phone', data),
  loginOTP:        (data) => api.post('/auth/login/otp', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
  sendDeleteOTP:   ()     => api.post('/auth/send-delete-otp'),
  deleteAccount:   (data) => api.delete('/auth/delete-account', { data }),
  me:              ()     => api.get('/auth/me'),
  updateProfile:   (data) => api.put('/auth/profile', data),
  login:           (data) => api.post('/auth/login', data),
};

// ─── Halwais ──────────────────────────────────────────────────────────────────
export const halwaiAPI = {
  search:          (params) => api.get('/halwais', { params }),
  getTop:          ()       => api.get('/halwais/top'),
  getById:         (id)     => api.get(`/halwais/${id}`),
  getMyProfile:    ()       => api.get('/halwais/profile/me'),
  updateProfile:   (data)   => api.put('/halwais/profile', data),
  addMenuItem:     (data)   => api.post('/halwais/menu', data),
  deleteMenuItem:  (id)     => api.delete(`/halwais/menu/${id}`),
  addPortfolio:    (data)   => api.post('/halwais/portfolio', data),
  deletePortfolio: (id)     => api.delete(`/halwais/portfolio/${id}`),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create:        (data)   => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getById:       (id)     => api.get(`/bookings/${id}`),
  updateStatus:  (id, data) => api.patch(`/bookings/${id}/status`, data),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder:  (data) => api.post('/payments/create-order', data),
  verify:       (data) => api.post('/payments/verify', data),
  getByBooking: (id)   => api.get(`/payments/booking/${id}`),
  getEarnings:  ()     => api.get('/payments/halwai-earnings'),
  refund:       (data) => api.post('/payments/refund', data),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  create:      (data)        => api.post('/reviews', data),
  getByHalwai: (id, params)  => api.get(`/reviews/halwai/${id}`, { params }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messageAPI = {
  getByBooking: (bookingId) => api.get(`/messages/${bookingId}`),
  send:         (data)      => api.post('/messages', data),
  unreadCount:  ()          => api.get('/messages/unread/count'),
};

// ─── Uploads ──────────────────────────────────────────────────────────────────
export const uploadAPI = {
  image: async (uri) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match    = /\.(\w+)$/.exec(filename);
    const type     = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri, name: filename, type });
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:          ()           => api.get('/admin/stats'),
  getPendingHalwais: ()           => api.get('/admin/halwais/pending'),
  verifyHalwai:      (id, action) => api.patch(`/admin/halwais/${id}/verify`, { action }),
  getBookings:       (params)     => api.get('/admin/bookings', { params }),
  toggleUser:        (id)         => api.patch(`/admin/users/${id}/toggle`),
};

export default api;