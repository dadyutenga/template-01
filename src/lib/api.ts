import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./authStorage";
import type { ApiError } from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      // Session expired or unauthorized
      authStorage.clearAll();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    const normalizedError: ApiError = {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.",
      errors: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
