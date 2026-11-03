import api from '@/lib/api';
import { authStorage } from '@/lib/authStorage';
import { resolveMediaUrl } from '@/lib/media';

// Types
export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;  // Changed from password_confirm to match backend
  user_type: 'student' | 'lecturer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string; // Token (OTP value or token from verify step) - REQUIRED
  new_password: string; // REQUIRED
  confirm_password: string; // REQUIRED
  // Note: API does NOT require email or otp fields, only token, new_password, confirm_password
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  email?: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'lecturer';
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
  date_joined?: string;
  profile_picture?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    access: string;
    refresh: string;
  };
}

// Authentication Service
class AuthService {
  // Register new user
  async register(data: RegisterData) {
    console.log('AuthService.register - Sending registration data:', {
      email: data.email,
      full_name: data.full_name,
      user_type: data.user_type,
      hasPassword: !!data.password,
      hasConfirmPassword: !!data.confirm_password,
      passwordsMatch: data.password === data.confirm_password
    }); // Debug log

    const response = await api.post('/v1/auth/register/', data);

    return response.data;
  }

  // Verify registration OTP
  async verifyRegistration(data: VerifyOTPData): Promise<AuthResponse> {
    const response = await api.post('/v1/auth/register/verify/', data);

    // Store tokens and user data
    if (response.data.data) {
      const responseData = response.data.data;
      const accessToken = responseData?.tokens?.access || responseData?.access;
      const refreshToken = responseData?.tokens?.refresh || responseData?.refresh;
      const user = normalizeAuthUser(responseData?.user);

      if (accessToken && refreshToken && user) {
        authStorage.setToken(accessToken);
        authStorage.setRefreshToken(refreshToken);
        authStorage.setUser(user);
      }
    }

    return response.data;
  }

  // Resend registration OTP
  async resendRegistrationOTP(email: string) {
    console.log('🔵 AuthService.resendRegistrationOTP - Sending request:', { email });

    // Validate email
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    try {
      const requestBody = { email: email.trim() };

      console.log('🔵 AuthService.resendRegistrationOTP - Endpoint: /v1/auth/register/resend/');
      console.log('🔵 AuthService.resendRegistrationOTP - Base URL:', api.defaults.baseURL);
      console.log('🔵 AuthService.resendRegistrationOTP - Full URL:', `${api.defaults.baseURL}/v1/auth/register/resend/`);

      console.log('🔵 AuthService.resendRegistrationOTP - Starting request...');
      console.log('🔵 AuthService.resendRegistrationOTP - Request timestamp:', new Date().toISOString());

      // Add a watchdog to detect if request hangs
      const requestStartTime = Date.now();
      const watchdog = setInterval(() => {
        const elapsed = Date.now() - requestStartTime;
        if (elapsed > 5000) {
          console.warn(`⏱️ Request still pending after ${elapsed}ms...`);
        }
      }, 1000);

      let response;
      try {
        response = await api.post('/v1/auth/register/resend/', requestBody, {
          timeout: 30000, // 30 seconds timeout
        });
        clearInterval(watchdog);
        console.log('🟢 AuthService.resendRegistrationOTP - Axios request completed!');
        console.log('🟢 Request took:', Date.now() - requestStartTime, 'ms');
      } catch (axiosError: any) {
        clearInterval(watchdog);
        console.error('🔴 Axios request failed:', {
          code: axiosError.code,
          message: axiosError.message,
          hasResponse: !!axiosError.response,
          status: axiosError.response?.status
        });

        // If axios fails with timeout or network error, try fetch as fallback
        if (axiosError.code === 'ECONNABORTED' ||
            axiosError.code === 'ERR_NETWORK' ||
            axiosError.message?.includes('timeout') ||
            !axiosError.response) {
          console.log('⚠️ Axios failed, trying fetch fallback...');
          try {
            response = await resendOTPWithFetch(email.trim());
            console.log('🟢 AuthService.resendRegistrationOTP - Fetch request completed!');
          } catch (fetchError: any) {
            console.error('🔴 Both axios and fetch failed');
            throw fetchError;
          }
        } else {
          throw axiosError;
        }
      }

      console.log('🟢 AuthService.resendRegistrationOTP - Request completed!');

      console.log('🟢 AuthService.resendRegistrationOTP - Response received!');
      console.log('🟢 AuthService.resendRegistrationOTP - Response status:', response.status);
      console.log('🟢 AuthService.resendRegistrationOTP - Response statusText:', response.statusText);

      // Handle different response formats
      if (response.data) {
        // If response has message field, return it
        if (response.data.message) {
          return response.data;
        }
        // If response is just a string message
        if (typeof response.data === 'string') {
          return { message: response.data };
        }
        // Return as is
        return response.data;
      }

      return { message: 'OTP resent successfully. Please check your email.' };
    } catch (error: any) {

      console.error('🔴 Error message:', error.message);
      console.error('🔴 Error code:', error.code);

      // Re-throw with enhanced error information
      throw error;
    }
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('AuthService.login called with:', { email: data.email }); // Debug log
    console.log('API URL:', api.defaults.baseURL); // Debug log

    const response = await api.post('/v1/auth/login/', data);

    // API returns: { message, data: { user, tokens: { access, refresh } } }
    const responseData = response.data.data;
    const user = normalizeAuthUser(responseData?.user);
    const accessToken = responseData?.tokens?.access || responseData?.access;
    const refreshToken = responseData?.tokens?.refresh || responseData?.refresh;

    if (accessToken && refreshToken && user) {
      console.log('💾 Storing tokens and user...', { user: user.email }); // Debug log
      authStorage.setToken(accessToken);
      authStorage.setRefreshToken(refreshToken);
      authStorage.setUser(user);

      // Verify storage immediately
      const verifyToken = authStorage.getToken();
      const verifyUser = authStorage.getUser();
      console.log('✅ Storage verification:', {
        tokenStored: !!verifyToken,
        userStored: !!verifyUser,
        userEmail: verifyUser?.email
      });
    }

    return response.data;
  }

  // Logout
  async logout() {
    const refreshToken = authStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await api.post('/v1/auth/logout/', { refresh: refreshToken });
      }
    } finally {
      // Clear all auth data regardless of API call result
      authStorage.clearAll();
    }
  }

  // Get user profile
  async getProfile() {
    const response = await api.get('/v1/auth/profile/');

    // Update stored user data
    if (response.data.data) {
      response.data.data = normalizeAuthUser(response.data.data);
      authStorage.setUser(response.data.data);
    }

    return response.data;
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData) {
    const response = await api.patch('/v1/auth/profile/', data);

    // Update stored user data - API returns: { message, data: { ... } }
    if (response.data.data) {
      response.data.data = normalizeAuthUser(response.data.data);
      authStorage.setUser(response.data.data);
    }

    return response.data;
  }

  // Upload profile image
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('profile_image', file);

    const response = await api.post('/v1/auth/profile/image/', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    // Backend may return a minimal payload: { profile_image_url: string | null }.
    // Merge into the currently stored user to avoid wiping username/email/etc.
    const newProfileImageUrl = resolveMediaUrl(response.data?.data?.profile_image_url ?? null);
    const currentUser = authStorage.getUser();
    const mergedUser = currentUser
      ? ({ ...currentUser, profile_image_url: newProfileImageUrl, profile_image: newProfileImageUrl } as User)
      : ({ profile_image_url: newProfileImageUrl } as unknown as User);

    authStorage.setUser(mergedUser);
    if (response.data?.data) {
      response.data.data = mergedUser;
    }

    return response.data;
  }

  // Remove profile image
  async removeProfileImage() {
    const response = await api.delete('/v1/auth/profile/image/');

    const newProfileImageUrl = resolveMediaUrl(response.data?.data?.profile_image_url ?? null);
    const currentUser = authStorage.getUser();
    const mergedUser = currentUser
      ? ({ ...currentUser, profile_image_url: newProfileImageUrl, profile_image: newProfileImageUrl } as User)
      : ({ profile_image_url: newProfileImageUrl } as unknown as User);

    authStorage.setUser(mergedUser);
    if (response.data?.data) {
      response.data.data = mergedUser;
    }

    return response.data;
  }

  // Change password
  async changePassword(data: ChangePasswordData) {
    const response = await api.post('/v1/auth/change-password/', data);
    return response.data;
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetData) {
    const response = await api.post('/v1/auth/password-reset/', data);
    return response.data;
  }

  // Verify password reset OTP
  async verifyPasswordResetOTP(data: VerifyOTPData) {
    const response = await api.post('/v1/auth/password-reset/verify/', data);
    return response.data;
  }

  // Confirm password reset
  // API: POST /api/v1/auth/password-reset-confirm/
  // Request body: { token: string, new_password: string, confirm_password: string }
  async confirmPasswordReset(data: PasswordResetConfirmData) {
    console.log('🔵 AuthService.confirmPasswordReset - Request:', {
      hasToken: !!data.token,
      tokenLength: data.token?.length,
      hasNewPassword: !!data.new_password,
      hasConfirmPassword: !!data.confirm_password
    });

    // Validate required fields - API requires: token, new_password, confirm_password (NO email)
    if (!data.token || !data.new_password || !data.confirm_password) {
      throw new Error('All fields (token, new_password, confirm_password) are required');
    }

    // Build request body - API expects ONLY: token, new_password, confirm_password
    const requestBody = {
      token: data.token.trim(),
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    };

    console.log('🔵 AuthService.confirmPasswordReset - Request body:', {
      hasToken: !!requestBody.token,
      tokenLength: requestBody.token.length,
      new_password: '***',
      confirm_password: '***',
      passwordLength: requestBody.new_password.length,
      confirmPasswordLength: requestBody.confirm_password.length,
      allFields: Object.keys(requestBody)
    });

      // Based on URL pattern: path('password-reset-confirm/', ...)
      // The endpoint is /v1/auth/password-reset-confirm/
      // Request body: { token, new_password, confirm_password }
      console.log('🔵 Attempting password reset confirm at: /v1/auth/password-reset-confirm/');

      const response = await api.post('/v1/auth/password-reset-confirm/', requestBody, {
        validateStatus: (status) => {
          // Don't throw error for any status, let us handle it
          return status >= 200 && status < 600;
        }
      });

      console.log('🟢 AuthService.confirmPasswordReset - Response status:', response.status);

      // Check if response indicates an error
      if (response.status >= 400) {
        const errorData = response.data;
        let errorMessage = 'Failed to reset password';

        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorMessage;
          } else if (errorData.errors) {
            if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ');
            } else if (typeof errorData.errors === 'object') {
              const errorMessages = Object.entries(errorData.errors).map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${value}`;
              });
              errorMessage = errorMessages.join('; ');
            }
          }
        }

        console.error('🔴 Password reset confirm returned error status:', {
          status: response.status,
          errorMessage,
          errorData
        });

        const error = new Error(errorMessage);
        (error as any).response = { data: errorData, status: response.status, statusText: response.statusText };
        (error as any).status = response.status;
        throw error;
      }

      console.log('✅ Password reset confirm successful!');
      return response.data;
  }

  // Resend password reset OTP
  // API: POST /api/v1/auth/password-reset/resend/
  async resendPasswordResetOTP(email: string) {
    console.log('🔵 AuthService.resendPasswordResetOTP - Sending request:', { email });
    const response = await api.post('/v1/auth/password-reset/resend/', { email });

    return response.data;
  }

  // Refresh access token using refresh token
  // API: POST /api/v1/auth/token/refresh/
  async refreshToken(): Promise<{ access: string; refresh?: string }> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔵 AuthService - Refreshing token...');

      // API expects: { refresh: "refresh_token_string" }
      const response = await api.post('/v1/auth/token/refresh/', {
        refresh: refreshToken
      });

      const responseData = response.data;

      // API returns: { access: "new_access_token", refresh?: "new_refresh_token" }
      // Or wrapped: { success: true, data: { access: "...", refresh?: "..." } }
      let newAccessToken: string | undefined;
      let newRefreshToken: string | undefined;

      if (responseData?.data) {
        // Wrapped response
        newAccessToken = responseData.data.access;
        newRefreshToken = responseData.data.refresh;
      } else {
        // Direct response
        newAccessToken = responseData?.access;
        newRefreshToken = responseData?.refresh;
      }

      if (!newAccessToken) {

        throw new Error('Invalid token refresh response: no access token');
      }

      console.log('✅ AuthService - Updating tokens in storage');
      authStorage.setToken(newAccessToken);
      if (newRefreshToken) {
        authStorage.setRefreshToken(newRefreshToken);
      }

      return { access: newAccessToken, refresh: newRefreshToken };
    } catch (error: any) {

      // Clear tokens if refresh fails
      authStorage.clearAll();
      throw error;
    }
  }

  // Get current user from configured auth storage
  getCurrentUser(): User | null {
    return authStorage.getUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return authStorage.isAuthenticated();
  }

  // Get access token
  getAccessToken(): string | null {
    return authStorage.getToken();
  }
}

function normalizeAuthUser(user: any): User {
  if (!user) return user;

  // Prefer the stable backend URL, fall back only for older payloads.
  // Backend contract: `profile_image_url` is the supported frontend field.
  const preferredProfileImageUrl = resolveMediaUrl(user.profile_image_url ?? null);
  const legacyProfileImageUrl = resolveMediaUrl(user.profile_image || user.profile_picture || null);
  const resolvedProfileImageUrl = preferredProfileImageUrl || legacyProfileImageUrl;
  const normalizedFullName = user.full_name || user.username || '';

  return {
    ...user,
    username: user.username || normalizedFullName,
    full_name: normalizedFullName,
    // Keep legacy fields populated for older parts of the app, but always prefer `profile_image_url`.
    profile_picture: resolvedProfileImageUrl,
    profile_image: resolvedProfileImageUrl,
    profile_image_url: preferredProfileImageUrl || resolvedProfileImageUrl,
  };
}

// Fallback: Resend OTP using fetch API (if axios fails)
const resendOTPWithFetch = async (email: string) => {
  const baseURL = import.meta.env.VITE_API_URL || 'https://api.kibegi.com/api';
  const url = `${baseURL}/v1/auth/register/resend/`;

  console.log('🔵 ResendOTP (Fetch) - Starting request:', { url, email });

  // Use AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏱️ ResendOTP timeout - aborting request');
    controller.abort();
  }, 30000); // 30 seconds

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    console.log('🟢 ResendOTP (Fetch) - Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }

      const error: any = new Error(errorMessage);
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: { message: errorMessage }
      };
      error.status = response.status;
      throw error;
    }

    // Parse successful response
    const data = await response.json();

    // Convert to axios-like response format
    return {
      status: response.status,
      statusText: response.statusText,
      data: data
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError: any = new Error('Request timeout: The server did not respond within 30 seconds');
      timeoutError.code = 'ECONNABORTED';
      throw timeoutError;
    }

    throw error;
  }
};

export default new AuthService();
