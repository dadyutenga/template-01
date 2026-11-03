import axios, { AxiosHeaders } from 'axios';
import { authStorage } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.kibegi.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure proper handling of FormData
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // Default timeout for all requests (2 minutes for regular, overridden for uploads)
  timeout: 120000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();

    // Don't add auth token for registration/login endpoints (they don't require auth)
    const publicEndpoints = [
      '/v1/auth/register/',
      '/v1/auth/login/',
      '/v1/auth/register/resend/',
      '/v1/auth/password-reset/',
      '/v1/auth/password-reset/resend/',
      '/v1/auth/password-reset/verify/',
      '/v1/auth/password-reset/confirm/',
      '/v1/auth/password-reset-confirm/', // URL pattern: path('password-reset-confirm/', ...)
      '/v1/auth/token/refresh/', // Token refresh doesn't need auth token
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (isPublicEndpoint) {
      // Explicitly remove Authorization header for public endpoints
      // This prevents sending expired/invalid tokens that could cause issues
      if (config.headers) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
    } else if (token) {
      // Only add Authorization header for protected endpoints
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: Remove Content-Type header for FormData - browser MUST set it with boundary
    // This is essential for mobile browsers to work correctly
    if (config.data instanceof FormData) {
      // Create a completely fresh headers object
      // This ensures mobile browsers don't have issues with header manipulation
      const newHeaders: Record<string, string> = {};

      // Only add Authorization header if token exists and not a public endpoint
      if (token && !isPublicEndpoint) {
        newHeaders['Authorization'] = `Bearer ${token}`;
      }

      // DO NOT set Content-Type - browser will automatically set:
      // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
      // Setting it manually breaks mobile uploads

      // Replace headers object completely
      config.headers = AxiosHeaders.from(newHeaders);

      // Don't modify transformRequest - let axios handle FormData natively
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't redirect to login for 401 on public endpoints (like resend-otp, refresh token)
    const isPublicEndpoint = error.config?.url?.includes('/register/') ||
      error.config?.url?.includes('/login/') ||
      error.config?.url?.includes('/password-reset/') ||
      error.config?.url?.includes('/token/refresh/');

    // Handle 401 Unauthorized - try to refresh token if "Remember Me" is enabled
    if (error.response?.status === 401 && !isPublicEndpoint) {
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      const refreshToken = authStorage.getRefreshToken();

      // Only try to refresh if "Remember Me" is enabled and we have a refresh token
      if (rememberMe && refreshToken && !error.config._retry) {
        error.config._retry = true; // Prevent infinite retry loop

        try {

          // Import authService dynamically to avoid circular dependency
          const { default: authService } = await import('@/services/authService');
          const { access } = await authService.refreshToken();

          // Update the failed request with new token
          error.config.headers.Authorization = `Bearer ${access}`;

          // Retry the original request with new token
          return api(error.config);
        } catch (refreshError) {

          authStorage.clearAll();
          localStorage.removeItem('remember_me');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // "Remember Me" not enabled or no refresh token - log out

        authStorage.clearAll();
        localStorage.removeItem('remember_me');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
