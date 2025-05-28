
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User exists but profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  // Check if user needs to reset password (but not if already on the reset page)
  if (profile.must_reset_pw && location.pathname !== '/set-new-password') {
    return <Navigate to="/set-new-password" replace />;
  }

  // If user is on set-new-password page but doesn't need to reset password
  if (!profile.must_reset_pw && location.pathname === '/set-new-password') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
