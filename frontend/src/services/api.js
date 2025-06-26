import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import toast from "react-hot-toast";
console.log("✅ API_BASE_URL used by axios:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      toast.error("Session expirée, veuillez vous reconnecter");
    }
    return Promise.reject(error);
  },
);

// API d'authentification
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
};

// API des trajets
export const tripsAPI = {
  getTrips: (params) => api.get("/trips", { params }),
  getMyTrips: (params) => api.get("/trips/my-trips", { params }),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (tripData) => api.post("/trips", tripData),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  completeTrip: (id) => api.post(`/trips/${id}/complete`),
};

// API des demandes
export const requestsAPI = {
  getRequests: (params) => api.get("/requests", { params }),
  getReceivedRequests: (params) => api.get("/requests/received", { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  createRequest: (requestData) => api.post("/requests", requestData),
  acceptRequest: (id, message) =>
    api.put(`/requests/${id}/accept`, { message }),
  rejectRequest: (id, message) =>
    api.put(`/requests/${id}/reject`, { message }),
  cancelRequest: (id) => api.put(`/requests/${id}/cancel`),
  confirmPickup: (id) => api.put(`/requests/${id}/pickup-confirm`),
  confirmDelivery: (id, signature) =>
    api.put(`/requests/${id}/delivery-confirm`, { signature }),
  getChatRequests: () => api.get("/requests/with-chats"),
  getRequestChat: (requestId) => api.get(`/requests/${requestId}/chat`),
};

// API des évaluations
export const reviewsAPI = {
  getReviews: (userId) => api.get(`/reviews/user/${userId}`),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  getMyReviews: () => api.get("/reviews/my-reviews"),
};

// API des utilisateurs
export const usersAPI = {
  updateProfile: (userData) => api.put("/users/profile", userData),
  uploadAvatar: (formData) =>
    api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getStats: () => api.get("/users/stats"),
};

// API du chat
export const chatAPI = {
  getChats: () => api.get("/chat"),
  getChatMessages: (requestId) => api.get(`/chat/${requestId}/messages`),
  createChat: (requestId) => api.post("/chat", { requestId }),
};

// API d'administration
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTrips: (params) => api.get("/admin/trips", { params }),
  getRequests: (params) => api.get("/admin/requests", { params }),
  getReports: (params) => api.get("/admin/reports", { params }),
};

export default api;
