
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/config/queryClient';
import { authRoutes } from '@/routes/authRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { leadRoutes } from '@/routes/leadRoutes';
import { restaurantRoutes } from '@/routes/restaurantRoutes';
import { visitRoutes } from '@/routes/visitRoutes';
import { orderRoutes } from '@/routes/orderRoutes';
import { reportRoutes } from '@/routes/reportRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { otherRoutes } from '@/routes/otherRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes - no layout */}
            {authRoutes}
            
            {/* Dashboard routes - modern layout */}
            {dashboardRoutes}
            
            {/* Feature routes - dashboard layout */}
            {leadRoutes}
            {restaurantRoutes}
            {visitRoutes}
            {orderRoutes}
            {reportRoutes}
            {adminRoutes}
            {otherRoutes}
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
