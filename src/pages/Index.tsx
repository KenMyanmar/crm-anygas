
import Dashboard from './Dashboard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('Index page rendering - auth state:', { userId: user?.id, isLoading });
  
  // If authentication is still loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-8 bg-muted rounded mb-4"></div>
          <div className="text-muted-foreground">Loading authentication...</div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated and we're not already on the login page,
  // redirect to login
  if (!user) {
    console.log('Index: User not authenticated, redirecting to login');
    // Prevent redirect loop by checking if we're already coming from /login
    const isFromLogin = location.key && location.state?.from === '/login';
    if (!isFromLogin) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    } else {
      // If we're in a loop, just render a fallback instead of redirecting again
      return (
        <div className="flex items-center justify-center min-h-screen flex-col">
          <div className="text-xl font-semibold mb-4">Authentication Required</div>
          <p className="text-muted-foreground mb-4">Please log in to access this page.</p>
          <a href="/login" className="text-primary underline">Go to login page</a>
        </div>
      );
    }
  }
  
  // User is authenticated, show dashboard
  console.log('Index: User authenticated, showing dashboard');
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default Index;
