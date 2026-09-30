import axios from 'axios';
import { useAppStore } from '../store/useAppStore';
import { showApiErrorToast, showRateLimitToast } from '../hooks/useApiErrorToast';

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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Avoid logout loop if 401 is returned on login/register
        const isAuthUrl = error.config?.url?.includes('/auth/');
        if (!isAuthUrl) {
          useAppStore.getState().logout();
        }
      } else if (status === 429) {
        // Read retry-after header (axios lowercases headers), fallback to body or default 60s
        const headerVal = error.response.headers?.['retry-after'];
        const parsedHeader = headerVal ? parseInt(String(headerVal), 10) : NaN;
        const bodySeconds = Number(error.response.data?.retryAfterSeconds);
        const retryAfterSeconds = !isNaN(parsedHeader) && parsedHeader > 0
          ? parsedHeader
          : (!isNaN(bodySeconds) && bodySeconds > 0 ? bodySeconds : 60);

        showRateLimitToast(retryAfterSeconds);
      } else if (status === 403 || status === 404 || status >= 500) {
        showApiErrorToast(error);
      }
      // Note: Status 400 is deliberately omitted here. Validation failures are field-mapped
      // by Plan 05-08 at the mutation level, and a generic toast here would double-report them.
    }

    return Promise.reject(error);
  }
);

export default api;
