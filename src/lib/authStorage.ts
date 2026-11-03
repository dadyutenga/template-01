import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'remember_me';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

// Cookie options - 7 days expiry (matching refresh token) for remember me
const cookieOptions = {
  expires: 7,
  secure: window.location.protocol === 'https:',
  sameSite: 'strict' as const,
};

// Session-only cookie options (expires when browser closes)
const sessionCookieOptions = {
  secure: window.location.protocol === 'https:',
  sameSite: 'strict' as const,
};

export const authStorage = {
  // Remember me preference
  getRememberMe(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  },

  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  },

  getRememberedEmail(): string {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  },

  setRememberedEmail(email: string, remember: boolean): void {
    if (remember && email.trim()) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  },

  getStorage(rememberMe: boolean): Storage {
    return rememberMe ? localStorage : sessionStorage;
  },

  // Token management
  getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    const rememberMe = this.getRememberMe();
    const options = rememberMe ? cookieOptions : sessionCookieOptions;
    const storage = this.getStorage(rememberMe);
    
    Cookies.set(TOKEN_KEY, token, options);
    storage.setItem(TOKEN_KEY, token);
    (rememberMe ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
  },

  removeToken(): void {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  // Refresh token management
  getRefreshToken(): string | null {
    return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    const rememberMe = this.getRememberMe();
    const options = rememberMe ? cookieOptions : sessionCookieOptions;
    const storage = this.getStorage(rememberMe);
    
    Cookies.set(REFRESH_TOKEN_KEY, token, options);
    storage.setItem(REFRESH_TOKEN_KEY, token);
    (rememberMe ? sessionStorage : localStorage).removeItem(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken(): void {
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // User data management
  getUser(): any | null {
    try {
      const userStr = Cookies.get(USER_KEY) || localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any): void {
    const userStr = JSON.stringify(user);
    const rememberMe = this.getRememberMe();
    const options = rememberMe ? cookieOptions : sessionCookieOptions;
    const storage = this.getStorage(rememberMe);
    
    Cookies.set(USER_KEY, userStr, options);
    storage.setItem(USER_KEY, userStr);
    (rememberMe ? sessionStorage : localStorage).removeItem(USER_KEY);
  },

  removeUser(): void {
    Cookies.remove(USER_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  // Clear all auth data
  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUser());
  },
};
