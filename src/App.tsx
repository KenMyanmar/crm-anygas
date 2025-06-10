
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Pages
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SetNewPassword from '@/pages/SetNewPassword';
import Dashboard from '@/pages/Dashboard';
import CalendarPage from '@/components/calendar/CalendarPage';
import TasksPage from '@/components/tasks/TasksPage';
import RestaurantsPage from '@/pages/restaurants/RestaurantListPage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import RestaurantEditPage from '@/pages/RestaurantEditPage';
import LeadsPage from '@/pages/leads/LeadsPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import LeadEditPage from '@/pages/LeadEditPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import OrderEditPage from '@/pages/OrderEditPage';
import UcoDashboardPage from '@/pages/uco/UcoDashboardPage';
import UcoCollectionPlanDetailPage from '@/pages/uco/UcoCollectionPlanDetailPage';
import UcoRouteOptimizationPage from '@/pages/uco/UcoRouteOptimizer';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } />

              {/* Restaurants routes */}
              <Route path="/restaurants" element={
                <ProtectedRoute>
                  <RestaurantsPage />
                </ProtectedRoute>
              } />
              <Route path="/restaurants/:id" element={
                <ProtectedRoute>
                  <RestaurantDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/restaurants/:id/edit" element={
                <ProtectedRoute>
                  <RestaurantEditPage />
                </ProtectedRoute>
              } />

              {/* Leads routes */}
              <Route path="/leads" element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              } />
              <Route path="/leads/:id" element={
                <ProtectedRoute>
                  <LeadDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/leads/:id/edit" element={
                <ProtectedRoute>
                  <LeadEditPage />
                </ProtectedRoute>
              } />

              {/* Orders routes */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id/edit" element={
                <ProtectedRoute>
                  <OrderEditPage />
                </ProtectedRoute>
              } />

              {/* UCO Collection routes */}
              <Route path="/uco/dashboard" element={
                <ProtectedRoute>
                  <UcoDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/uco/plans/:id" element={
                <ProtectedRoute>
                  <UcoCollectionPlanDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/uco/routes" element={
                <ProtectedRoute>
                  <UcoRouteOptimizationPage />
                </ProtectedRoute>
              } />

              {/* Settings route */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />

              {/* Admin route */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              
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
