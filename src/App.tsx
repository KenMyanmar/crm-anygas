
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import AppLayout from '@/components/layouts/AppLayout';

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
            <Routes>
              {/* Public routes - no layout wrapper */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />

              {/* Protected routes - wrapped with AppLayout */}
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
              <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />

              {/* Restaurant routes */}
              <Route path="/restaurants" element={<AppLayout><RestaurantsPage /></AppLayout>} />
              <Route path="/restaurants/new" element={<AppLayout><NewRestaurantPage /></AppLayout>} />
              <Route path="/restaurants/:id" element={<AppLayout><RestaurantDetailPage /></AppLayout>} />
              <Route path="/restaurants/:id/edit" element={<AppLayout><RestaurantEditPage /></AppLayout>} />

              {/* Lead routes */}
              <Route path="/leads" element={<AppLayout><LeadsPage /></AppLayout>} />
              <Route path="/leads/assigned" element={<AppLayout><AssignedLeadsPage /></AppLayout>} />
              <Route path="/leads/meetings" element={<AppLayout><MeetingsPage /></AppLayout>} />
              <Route path="/leads/new" element={<AppLayout><NewLeadPage /></AppLayout>} />
              <Route path="/leads/call/new" element={<AppLayout><NewCallPage /></AppLayout>} />
              <Route path="/leads/meetings/new" element={<AppLayout><NewMeetingPage /></AppLayout>} />
              <Route path="/leads/calls/:id" element={<AppLayout><CallDetailPage /></AppLayout>} />
              <Route path="/leads/meetings/:id" element={<AppLayout><MeetingDetailPage /></AppLayout>} />

              {/* Visit routes */}
              <Route path="/visits" element={<AppLayout><VisitPlannerPage /></AppLayout>} />
              <Route path="/visits/today" element={<AppLayout><VisitPlannerPage /></AppLayout>} />
              <Route path="/visits/new" element={<AppLayout><VisitPlannerPage /></AppLayout>} />
              <Route path="/visits/plans/:id" element={<AppLayout><VisitPlanDetailPage /></AppLayout>} />
              <Route path="/visits/tasks/:id/outcome" element={<AppLayout><TaskOutcomePage /></AppLayout>} />

              {/* Order routes */}
              <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
              <Route path="/orders/new" element={<AppLayout><NewOrderPage /></AppLayout>} />
              <Route path="/orders/pending" element={<AppLayout><PendingOrdersPage /></AppLayout>} />
              <Route path="/orders/process" element={<AppLayout><OrdersPage /></AppLayout>} />
              <Route path="/orders/delivered" element={<AppLayout><DeliveredOrdersPage /></AppLayout>} />
              <Route path="/orders/:id" element={<AppLayout><OrderDetailPage /></AppLayout>} />

              {/* Report routes */}
              <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
              <Route path="/reports/leads" element={<AppLayout><LeadReportsPage /></AppLayout>} />
              <Route path="/reports/performance" element={<AppLayout><PerformancePage /></AppLayout>} />

              {/* Admin routes */}
              <Route path="/admin/users" element={<AppLayout><UsersPage /></AppLayout>} />
              <Route path="/admin/products" element={<AppLayout><ProductsPage /></AppLayout>} />
              <Route path="/admin/import" element={<AppLayout><ImportPage /></AppLayout>} />
              <Route path="/admin/restaurants" element={<AppLayout><RestaurantManagementPage /></AppLayout>} />
              <Route path="/admin/migration" element={<AppLayout><RestaurantMigrationPage /></AppLayout>} />
              <Route path="/admin/settings" element={<AppLayout><SettingsPage /></AppLayout>} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
