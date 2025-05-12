
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 * This is the recommended pattern with React Router v6
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { 
      isAuthenticated: !!user, 
      isLoading, 
      userId: user?.id,
      currentPath: location.pathname
    });
  }, [user, isLoading, location.pathname]);
  
  // While checking auth status, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-8 bg-muted rounded mb-4"></div>
          <div className="text-muted-foreground">Verifying authentication...</div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    // Use state to remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // User is authenticated, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;
