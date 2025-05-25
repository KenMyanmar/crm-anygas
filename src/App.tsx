
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Main pages
import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/ProfilePage';
import Notifications from '@/pages/Notifications';
import SettingsPage from '@/pages/SettingsPage';

// Leads pages
import LeadsPage from '@/pages/leads/LeadsPage';
import AssignedLeadsPage from '@/pages/leads/AssignedLeadsPage';
import MeetingsPage from '@/pages/leads/MeetingsPage';
import NewLeadPage from '@/pages/leads/NewLeadPage';

// Restaurant pages
import RestaurantsPage from '@/pages/placeholder/RestaurantsPage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import RestaurantEditPage from '@/pages/RestaurantEditPage';
import NewRestaurantPage from '@/pages/restaurants/NewRestaurantPage';

// Orders pages
import OrdersPage from '@/pages/orders/OrdersPage';
import PendingOrdersPage from '@/pages/orders/PendingOrdersPage';
import DeliveredOrdersPage from '@/pages/orders/DeliveredOrdersPage';
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';

// Reports pages
import ReportsPage from '@/pages/placeholder/ReportsPage';
import LeadReportsPage from '@/pages/reports/LeadReportsPage';
import PerformancePage from '@/pages/reports/PerformancePage';

// Admin pages
import UsersPage from '@/pages/admin/UsersPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import ImportPage from '@/pages/admin/ImportPage';
import AdminSettingsPage from '@/pages/admin/SettingsPage';

import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* Leads routes */}
            <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
            <Route path="/leads/new" element={<ProtectedRoute><NewLeadPage /></ProtectedRoute>} />
            <Route path="/leads/assigned" element={<ProtectedRoute><AssignedLeadsPage /></ProtectedRoute>} />
            <Route path="/leads/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />
            
            {/* Restaurant routes */}
            <Route path="/restaurants" element={<ProtectedRoute><RestaurantsPage /></ProtectedRoute>} />
            <Route path="/restaurants/new" element={<ProtectedRoute><NewRestaurantPage /></ProtectedRoute>} />
            <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetailPage /></ProtectedRoute>} />
            <Route path="/restaurants/:id/edit" element={<ProtectedRoute><RestaurantEditPage /></ProtectedRoute>} />
            
            {/* Orders routes */}
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/new" element={<ProtectedRoute><NewOrderPage /></ProtectedRoute>} />
            <Route path="/orders/pending" element={<ProtectedRoute><PendingOrdersPage /></ProtectedRoute>} />
            <Route path="/orders/delivered" element={<ProtectedRoute><DeliveredOrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            
            {/* Reports routes */}
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/reports/leads" element={<ProtectedRoute><LeadReportsPage /></ProtectedRoute>} />
            <Route path="/reports/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/admin/import" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
