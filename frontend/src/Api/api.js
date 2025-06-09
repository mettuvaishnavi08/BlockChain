import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Auth endpoints
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),

  // Institution endpoints
  applyInstitution: (institutionData) => api.post('/institutions/apply', institutionData),
  getPendingInstitutions: () => api.get('/admin/institutions/pending'),
  approveInstitution: (institutionId) => api.put(`/admin/institutions/${institutionId}/approve`),
  rejectInstitution: (institutionId) => api.put(`/admin/institutions/${institutionId}/reject`),

  // Credential endpoints
  issueCredential: (credentialData) => api.post('/credentials/issue', credentialData),
  verifyCredential: (credentialId) => api.get(`/credentials/verify/${credentialId}`),
  getMyCredentials: () => api.get('/credentials/my'),
  revokeCredential: (credentialId) => api.put(`/admin/credentials/${credentialId}/revoke`),

  // Admin endpoints
  getAdminStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getAllCredentials: () => api.get('/admin/credentials'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Health check
  healthCheck: () => api.get('/health'),
};

export default apiService;