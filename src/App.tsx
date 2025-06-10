
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// page imports
import RestaurantListPage from '@/pages/restaurants/RestaurantListPage';
import NewRestaurantPage from '@/pages/restaurants/NewRestaurantPage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import EditRestaurantPage from '@/pages/RestaurantEditPage';
import LeadsPage from '@/pages/leads/LeadsPage';
import AssignedLeadsPage from '@/pages/leads/AssignedLeadsPage';
import MeetingsPage from '@/pages/leads/MeetingsPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import ReportsPage from '@/pages/reports/ReportsMainPage';
import LeadReportsPage from '@/pages/reports/LeadReportsPage';
import PerformanceReportsPage from '@/pages/reports/PerformancePage';
import UsersManagementPage from '@/pages/admin/UsersPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import ImportDataPage from '@/pages/admin/ImportPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFound';
import NotificationsPage from '@/pages/Notifications';
import { DualBusinessDashboard } from '@/components/dashboard/DualBusinessDashboard';
import { visitRoutes } from '@/routes/visitRoutes';
import { ucoRoutes } from '@/routes/ucoRoutes';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <DualBusinessDashboard />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Restaurants Routes */}
              <Route path="/restaurants" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <RestaurantListPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/restaurants/new" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <NewRestaurantPage />
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
                    <EditRestaurantPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Leads Routes */}
              <Route path="/leads" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <LeadsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/leads/assigned" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <AssignedLeadsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/leads/meetings" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <MeetingsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Visit Routes */}
              {visitRoutes}

              {/* UCO Routes */}
              {ucoRoutes}

              {/* Orders Routes */}
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

              {/* Reports Routes */}
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <ReportsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/reports/leads" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <LeadReportsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/reports/performance" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <PerformanceReportsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <UsersManagementPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <ProductsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/import" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <ImportDataPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <SettingsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* Profile & Notifications */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <ProfilePage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <ModernDashboardLayout>
                    <NotificationsPage />
                  </ModernDashboardLayout>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="bottom-right" />
          </div>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
