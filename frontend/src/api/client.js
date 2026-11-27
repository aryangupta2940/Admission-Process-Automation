import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

const api = axios.create({
  baseURL: rawBaseUrl ? `${rawBaseUrl}/api` : '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('abesec_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('abesec_token');
        localStorage.removeItem('abesec_user');
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return fallback;
}

export default api;
