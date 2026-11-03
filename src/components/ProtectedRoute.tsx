import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user,
    userEmail: user?.email,
    currentPath: window.location.pathname 
  });

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Authenticated, rendering protected content...');
  // Render children if authenticated
  return <>{children}</>;
};
