
import Dashboard from './Dashboard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  console.log('Index rendering - user:', user?.id, 'isLoading:', isLoading);
  
  useEffect(() => {
    // Clear any stale state that might be causing navigation issues
    if (!isLoading && !user) {
      console.log('Index: User not authenticated, redirecting to login from useEffect');
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);
  
  // If authentication is still loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-8 bg-muted rounded mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log('Index: User not authenticated, redirecting to login');
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
