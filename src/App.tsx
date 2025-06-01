
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import AuthWrapper from '@/components/AuthWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SetNewPassword from '@/pages/SetNewPassword';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
import Notifications from '@/pages/Notifications';

// Admin pages
import UsersPage from '@/pages/admin/UsersPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import ImportPage from '@/pages/admin/ImportPage';
import RestaurantManagementPage from '@/pages/admin/RestaurantManagementPage';
import RestaurantMigrationPage from '@/pages/admin/RestaurantMigrationPage';
import SettingsPage from '@/pages/admin/SettingsPage';

// Restaurant pages
import RestaurantsPage from '@/pages/placeholder/RestaurantsPage';
import NewRestaurantPage from '@/pages/restaurants/NewRestaurantPage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import RestaurantEditPage from '@/pages/RestaurantEditPage';

// Lead pages
import LeadsPage from '@/pages/leads/LeadsPage';
import AssignedLeadsPage from '@/pages/leads/AssignedLeadsPage';
import MeetingsPage from '@/pages/leads/MeetingsPage';
import NewLeadPage from '@/pages/leads/NewLeadPage';
import NewCallPage from '@/pages/leads/NewCallPage';
import NewMeetingPage from '@/pages/leads/NewMeetingPage';
import CallDetailPage from '@/pages/leads/CallDetailPage';
import MeetingDetailPage from '@/pages/leads/MeetingDetailPage';

// Visit pages
import VisitPlannerPage from '@/pages/visits/VisitPlannerPage';
import VisitPlanDetailPage from '@/pages/visits/VisitPlanDetailPage';
import TaskOutcomePage from '@/pages/visits/TaskOutcomePage';

// Order pages
import OrdersPage from '@/pages/orders/OrdersPage';
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import PendingOrdersPage from '@/pages/orders/PendingOrdersPage';
import DeliveredOrdersPage from '@/pages/orders/DeliveredOrdersPage';

// Report pages
import ReportsPage from '@/pages/placeholder/ReportsPage';
import LeadReportsPage from '@/pages/reports/LeadReportsPage';
import PerformancePage from '@/pages/reports/PerformancePage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Router>
          <AuthProvider>
            <AuthWrapper>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/set-new-password" element={<SetNewPassword />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Restaurant routes */}
                <Route path="/restaurants" element={<ProtectedRoute><RestaurantsPage /></ProtectedRoute>} />
                <Route path="/restaurants/new" element={<ProtectedRoute><NewRestaurantPage /></ProtectedRoute>} />
                <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetailPage /></ProtectedRoute>} />
                <Route path="/restaurants/:id/edit" element={<ProtectedRoute><RestaurantEditPage /></ProtectedRoute>} />

                {/* Lead routes */}
                <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                <Route path="/leads/assigned" element={<ProtectedRoute><AssignedLeadsPage /></ProtectedRoute>} />
                <Route path="/leads/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />
                <Route path="/leads/new" element={<ProtectedRoute><NewLeadPage /></ProtectedRoute>} />
                <Route path="/leads/call/new" element={<ProtectedRoute><NewCallPage /></ProtectedRoute>} />
                <Route path="/leads/meeting/new" element={<ProtectedRoute><NewMeetingPage /></ProtectedRoute>} />
                <Route path="/leads/calls/:id" element={<ProtectedRoute><CallDetailPage /></ProtectedRoute>} />
                <Route path="/leads/meetings/:id" element={<ProtectedRoute><MeetingDetailPage /></ProtectedRoute>} />

                {/* Visit routes */}
                <Route path="/visits" element={<ProtectedRoute><VisitPlannerPage /></ProtectedRoute>} />
                <Route path="/visits/today" element={<ProtectedRoute><VisitPlannerPage /></ProtectedRoute>} />
                <Route path="/visits/new" element={<ProtectedRoute><VisitPlannerPage /></ProtectedRoute>} />
                <Route path="/visits/plans/:id" element={<ProtectedRoute><VisitPlanDetailPage /></ProtectedRoute>} />
                <Route path="/visits/tasks/:id/outcome" element={<ProtectedRoute><TaskOutcomePage /></ProtectedRoute>} />

                {/* Order routes - Fixed to use the main OrdersPage with tabs */}
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/new" element={<ProtectedRoute><NewOrderPage /></ProtectedRoute>} />
                <Route path="/orders/pending" element={<ProtectedRoute><PendingOrdersPage /></ProtectedRoute>} />
                <Route path="/orders/process" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/delivered" element={<ProtectedRoute><DeliveredOrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

                {/* Report routes */}
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/reports/leads" element={<ProtectedRoute><LeadReportsPage /></ProtectedRoute>} />
                <Route path="/reports/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                <Route path="/admin/import" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
                <Route path="/admin/restaurants" element={<ProtectedRoute><RestaurantManagementPage /></ProtectedRoute>} />
                <Route path="/admin/migration" element={<ProtectedRoute><RestaurantMigrationPage /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
