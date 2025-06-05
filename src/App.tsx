
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Import pages - using correct file names
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SetNewPassword from '@/pages/SetNewPassword';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import LeadsList from '@/pages/leads/LeadsPage';
import LeadDetails from '@/pages/RestaurantDetailPage';
import CreateLead from '@/pages/leads/NewLeadPage';
import EditLead from '@/pages/leads/NewLeadPage';
import AssignedLeads from '@/pages/leads/AssignedLeadsPage';
import LeadMeetings from '@/pages/leads/MeetingsPage';
import RestaurantsList from '@/pages/placeholder/RestaurantsPage';
import RestaurantDetails from '@/pages/RestaurantDetailPage';
import CreateRestaurant from '@/pages/restaurants/NewRestaurantPage';
import EditRestaurant from '@/pages/RestaurantEditPage';
import VisitPlanner from '@/pages/visits/VisitPlannerPage';
import TodayVisits from '@/pages/visits/TodaysVisitsPage';
import CreateVisit from '@/pages/visits/NewVisitPlanPage';
import OrdersList from '@/pages/orders/OrdersPage';
import CreateOrder from '@/pages/orders/NewOrderPage';
import OrderDetails from '@/pages/orders/OrderDetailPage';
import SalesReports from '@/pages/placeholder/ReportsPage';
import LeadReports from '@/pages/reports/LeadReportsPage';
import PerformanceReports from '@/pages/reports/PerformancePage';
import UserManagement from '@/pages/admin/UsersPage';
import ProductManagement from '@/pages/admin/ProductsPage';
import ImportData from '@/pages/admin/ImportPage';
import Settings from '@/pages/SettingsPage';
import UserProfile from '@/pages/ProfilePage';

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
            {/* Auth routes - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-new-password" element={<SetNewPassword />} />
            
            {/* Dashboard routes - modern layout */}
            <Route path="/" element={
              <ModernDashboardLayout>
                <Dashboard />
              </ModernDashboardLayout>
            } />
            
            {/* Other routes - keep using original layout for now */}
            <Route path="/notifications" element={
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            } />
            
            {/* Leads routes */}
            <Route path="/leads" element={
              <DashboardLayout>
                <LeadsList />
              </DashboardLayout>
            } />
            <Route path="/leads/:id" element={
              <DashboardLayout>
                <LeadDetails />
              </DashboardLayout>
            } />
            <Route path="/leads/new" element={
              <DashboardLayout>
                <CreateLead />
              </DashboardLayout>
            } />
            <Route path="/leads/:id/edit" element={
              <DashboardLayout>
                <EditLead />
              </DashboardLayout>
            } />
            <Route path="/leads/assigned" element={
              <DashboardLayout>
                <AssignedLeads />
              </DashboardLayout>
            } />
            <Route path="/leads/meetings" element={
              <DashboardLayout>
                <LeadMeetings />
              </DashboardLayout>
            } />
            
            {/* Restaurant routes */}
            <Route path="/restaurants" element={
              <DashboardLayout>
                <RestaurantsList />
              </DashboardLayout>
            } />
            <Route path="/restaurants/:id" element={
              <DashboardLayout>
                <RestaurantDetails />
              </DashboardLayout>
            } />
            <Route path="/restaurants/new" element={
              <DashboardLayout>
                <CreateRestaurant />
              </DashboardLayout>
            } />
            <Route path="/restaurants/:id/edit" element={
              <DashboardLayout>
                <EditRestaurant />
              </DashboardLayout>
            } />
            
            {/* Visit routes */}
            <Route path="/visits" element={
              <DashboardLayout>
                <VisitPlanner />
              </DashboardLayout>
            } />
            <Route path="/visits/today" element={
              <DashboardLayout>
                <TodayVisits />
              </DashboardLayout>
            } />
            <Route path="/visits/new" element={
              <DashboardLayout>
                <CreateVisit />
              </DashboardLayout>
            } />
            
            {/* Order routes */}
            <Route path="/orders" element={
              <DashboardLayout>
                <OrdersList />
              </DashboardLayout>
            } />
            <Route path="/orders/new" element={
              <DashboardLayout>
                <CreateOrder />
              </DashboardLayout>
            } />
            <Route path="/orders/:id" element={
              <DashboardLayout>
                <OrderDetails />
              </DashboardLayout>
            } />
            
            {/* Report routes */}
            <Route path="/reports" element={
              <DashboardLayout>
                <SalesReports />
              </DashboardLayout>
            } />
            <Route path="/reports/leads" element={
              <DashboardLayout>
                <LeadReports />
              </DashboardLayout>
            } />
            <Route path="/reports/performance" element={
              <DashboardLayout>
                <PerformanceReports />
              </DashboardLayout>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            } />
            <Route path="/admin/products" element={
              <DashboardLayout>
                <ProductManagement />
              </DashboardLayout>
            } />
            <Route path="/admin/import" element={
              <DashboardLayout>
                <ImportData />
              </DashboardLayout>
            } />
            <Route path="/admin/settings" element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            } />
            
            {/* Profile routes */}
            <Route path="/profile" element={
              <DashboardLayout>
                <UserProfile />
              </DashboardLayout>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
