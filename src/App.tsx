

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { leadRoutes } from './routes/leadRoutes';
import { restaurantRoutes } from './routes/restaurantRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { ucoRoutes } from './routes/ucoRoutes';
import { reportRoutes } from './routes/reportRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { publicRoutes } from './routes/publicRoutes';
import { visitRoutes } from './routes/visitRoutes';
import { Toaster } from '@/components/ui/toaster';
import { NotificationProvider } from '@/context/NotificationContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                {publicRoutes}

                {/* Dashboard Routes */}
                {dashboardRoutes}

                {/* Lead Routes */}
                {leadRoutes}

                {/* Restaurant Routes */}
                {restaurantRoutes}

                {/* Order Routes */}
                {orderRoutes}

                {/* Visit Routes */}
                {visitRoutes}

                {/* UCO Routes */}
                {ucoRoutes}

                {/* Report Routes */}
                {reportRoutes}

                {/* Admin Routes */}
                {adminRoutes}
              </Routes>
              <Toaster />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

