
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { queryClient } from '@/config/queryClient';

// Route imports
import { authRoutes } from '@/routes/authRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { restaurantRoutes } from '@/routes/restaurantRoutes';
import { leadRoutes } from '@/routes/leadRoutes';
import { orderRoutes } from '@/routes/orderRoutes';
import { visitRoutes } from '@/routes/visitRoutes';
import { ucoRoutes } from '@/routes/ucoRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              {authRoutes}

              {/* Protected routes */}
              {dashboardRoutes}
              {restaurantRoutes}
              {leadRoutes}
              {orderRoutes}
              {visitRoutes}
              {ucoRoutes}
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
          <SonnerToaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
