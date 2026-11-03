import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, UserRole, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { authStorage } from "@/lib/authStorage";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_MOCK_USER: User = {
  id: "usr_demo_1",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  role: "admin",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  department: "Engineering",
  createdAt: "2024-01-15T10:00:00.000Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    return authStorage.getUser() || DEFAULT_MOCK_USER;
  });
  const [token, setToken] = useState<string | null>(() => {
    return authStorage.getToken() || "demo-jwt-token-placeholder";
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If first time visiting, initialize with demo session for seamless preview
    if (!authStorage.getToken() && !authStorage.getUser()) {
      authStorage.setToken("demo-jwt-token-placeholder");
      authStorage.setUser(DEFAULT_MOCK_USER);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      const role: UserRole = credentials.email.includes("admin")
        ? "admin"
        : credentials.email.includes("manager")
          ? "manager"
          : "user";

      const loggedUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.email.split("@")[0].replace(/[._]/g, " "),
        email: credentials.email,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        createdAt: new Date().toISOString(),
      };

      const mockToken = `mock-token-${Date.now()}`;
      authStorage.setToken(mockToken, credentials.rememberMe ?? true);
      authStorage.setUser(loggedUser);

      setToken(mockToken);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role || "user",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        createdAt: new Date().toISOString(),
      };

      const mockToken = `mock-token-${Date.now()}`;
      authStorage.setToken(mockToken, true);
      authStorage.setUser(newUser);

      setToken(mockToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authStorage.clearAll();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates: Partial<User>): void => {
    if (!user) return;
    const updated = { ...user, ...updates };
    authStorage.setUser(updated);
    setUser(updated);
  };

  const switchRole = (role: UserRole): void => {
    if (!user) return;
    updateUser({ role });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
