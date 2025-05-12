
import Dashboard from './Dashboard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('Index page rendering - auth state:', { userId: user?.id, isLoading, pathname: location.pathname });
  
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
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log('Index: User not authenticated, redirecting to login');
    // Use replace to prevent adding to history stack
    return <Navigate to="/login" replace />;
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
