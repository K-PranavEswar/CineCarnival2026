import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const moviesAPI = {
  getAll: () => api.get('/movies'),
  create: (data) => api.post('/movies', data),
};

export const theatresAPI = {
  getByMovie: (movieId) => api.get(`/theatres/${movieId}`),
  create: (data) => api.post('/theatres', data),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  createOrder: (data) => api.post('/bookings/create-order', data),
  verifyPayment: (data) => api.post('/bookings/verify', data),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getAll: () => api.get('/bookings/all'),
  delete: (bookingId) => api.delete(`/bookings/${bookingId}`),
  updateSeats: (bookingId, data) => api.put(`/bookings/${bookingId}/seats`, data),
};

export default api;
