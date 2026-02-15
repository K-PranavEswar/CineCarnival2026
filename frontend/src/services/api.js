import axios from "axios";

/*
FINAL PRODUCTION-SAFE API CONFIG
This guarantees correct backend usage.
*/

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://cinecarnival2026.onrender.com/api";

console.log("CINE CARNIVAL API:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
Attach JWT automatically
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
Handle unauthorized globally
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized. Redirecting to login.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/*
AUTH APIs
*/
export const authAPI = {
  register: (data) => api.post("/auth/register", data),

  login: (data) => api.post("/auth/login", data),
};

/*
MOVIE APIs
*/
export const moviesAPI = {
  getAll: () => api.get("/movies"),

  create: (data) => api.post("/movies", data),
};

/*
THEATRE APIs
*/
export const theatresAPI = {
  getByMovie: (movieId) => api.get(`/theatres/${movieId}`),

  create: (data) => api.post("/theatres", data),
};

/*
BOOKING APIs
*/
export const bookingsAPI = {
  create: (data) => api.post("/bookings", data),

  createOrder: (data) => api.post("/bookings/create-order", data),

  verifyPayment: (data) => api.post("/bookings/verify", data),

  getByUser: (userId) => api.get(`/bookings/user/${userId}`),

  getAll: () => api.get("/bookings/all"),

  delete: (bookingId) => api.delete(`/bookings/${bookingId}`),

  updateSeats: (bookingId, data) =>
    api.put(`/bookings/${bookingId}/seats`, data),
};

export default api;
