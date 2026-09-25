import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

export const api = axios.create({
  baseURL: (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid logout loop if 401 is returned on login/register
      const isAuthUrl = error.config?.url?.includes('/auth/');
      if (!isAuthUrl) {
        useAppStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
