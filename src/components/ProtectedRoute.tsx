
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { profile, isLoading } = useAuth();
  
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
  
  // If not logged in, redirect to login
  if (!profile) {
    return <Navigate to="/login" />;
  }
  
  // Check for role requirements if specified
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  // User is authenticated and has proper role, render the protected content within the layout
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
