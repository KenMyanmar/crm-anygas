
import Dashboard from './Dashboard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  
  // If authentication is still loading, show nothing yet
  if (isLoading) {
    return null;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, show dashboard
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default Index;
