import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please make sure the server is running.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

export default api;


