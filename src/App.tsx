
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
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
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import OrderEditPage from '@/pages/OrderEditPage';
import UcoDashboardPage from '@/pages/uco/UcoCollectionDashboard';
import UcoCollectionPlanDetailPage from '@/pages/uco/UcoCollectionPlanDetailPage';
import UcoRouteOptimizationPage from '@/pages/uco/UcoRouteOptimizer';
import VisitPlannerPage from '@/pages/visits/VisitPlannerPage';
import TodaysVisitsPage from '@/pages/visits/TodaysVisitsPage';
import NewVisitPlanPage from '@/pages/visits/NewVisitPlanPage';
import VisitPlanDetailPage from '@/pages/visits/VisitPlanDetailPage';
import TaskOutcomePage from '@/pages/visits/TaskOutcomePage';
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

              {/* Protected routes with ModernDashboardLayout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <Dashboard />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <TasksPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Restaurants routes */}
              <Route path="/restaurants" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <RestaurantsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/restaurants/:id" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <RestaurantDetailPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/restaurants/:id/edit" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <RestaurantEditPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Leads routes */}
              <Route path="/leads" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <LeadsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/leads/:id" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <LeadDetailPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/leads/:id/edit" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <LeadEditPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Orders routes - NOW PROPERLY IMPLEMENTED */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <OrdersPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/orders/new" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <NewOrderPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <OrderDetailPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/orders/:id/edit" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <OrderEditPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Visits routes - NOW PROPERLY IMPLEMENTED */}
              <Route path="/visits" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <VisitPlannerPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/visits/today" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <TodaysVisitsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/visits/new" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <NewVisitPlanPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/visits/plans/:id" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <VisitPlanDetailPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/visits/tasks/:id/outcome" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <TaskOutcomePage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* UCO Collection routes - Already properly wrapped with ModernDashboardLayout */}
              <Route path="/uco/dashboard" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <UcoDashboardPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/uco/plans/:id" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <UcoCollectionPlanDetailPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/uco/routes" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <UcoRouteOptimizationPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Settings route */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <SettingsPage />
                  </ModernDashboardLayout>
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
