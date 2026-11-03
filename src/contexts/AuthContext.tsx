import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginData, AuthResponse, User as AuthUser } from '@/services/authService';
import { authStorage } from '@/lib/authStorage';

// Use the User type from authService for consistency
type User = AuthUser;

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state synchronously from storage (cookies + localStorage)
    console.log('🚀 AuthProvider: Initializing user state from storage...');
    console.log('📍 Current URL:', window.location.href);
    
    const storedUser = authStorage.getUser();
    const storedToken = authStorage.getToken();
    
    console.log('🔍 Storage check:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken,
      userEmail: storedUser?.email 
    });
    
    if (storedUser && storedToken) {
      console.log('✅ AuthProvider: Restoring user session for:', storedUser.email);
      return storedUser;
    }
    
    console.log('⚠️ AuthProvider: No stored user or token found');
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading to false after initial render to ensure auth state is stable
  useEffect(() => {
    console.log('✅ AuthProvider mounted, auth state ready');
    setIsLoading(false);
  }, []);
  
  console.log('👤 AuthProvider render - isAuthenticated:', !!user, 'user:', user?.email);

  const login = async (data: LoginData) => {
    console.log('🔑 AuthContext.login called...');
    const response = await authService.login(data);
    console.log('📦 Login response received:', { hasUser: !!response.data?.user, userEmail: response.data?.user?.email });
    
    if (response.data?.user) {
      console.log('🔐 Setting user state in AuthContext:', response.data.user.email);
      setUser(response.data.user);
      
      // Verify storage after setting state
      setTimeout(() => {
        const storedUser = authStorage.getUser();
        const storedToken = authStorage.getToken();
        console.log('✅ Post-login storage check:', { 
          hasStoredUser: !!storedUser, 
          hasStoredToken: !!storedToken,
          userEmail: storedUser?.email 
        });
      }, 100);
    } else {
      console.error('❌ No user data in login response');
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data || response;
      if (userData) {
        setUser(userData);
        authStorage.setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, try to get user from storage
      const storedUser = authStorage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
