import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import LeadsList from '@/pages/leads/LeadsList';
import LeadDetails from '@/pages/leads/LeadDetails';
import CreateLead from '@/pages/leads/CreateLead';
import EditLead from '@/pages/leads/EditLead';
import AssignedLeads from '@/pages/leads/AssignedLeads';
import LeadMeetings from '@/pages/leads/LeadMeetings';
import RestaurantsList from '@/pages/restaurants/RestaurantsList';
import RestaurantDetails from '@/pages/restaurants/RestaurantDetails';
import CreateRestaurant from '@/pages/restaurants/CreateRestaurant';
import EditRestaurant from '@/pages/restaurants/EditRestaurant';
import VisitPlanner from '@/pages/visits/VisitPlanner';
import TodayVisits from '@/pages/visits/TodayVisits';
import CreateVisit from '@/pages/visits/CreateVisit';
import OrdersList from '@/pages/orders/OrdersList';
import CreateOrder from '@/pages/orders/CreateOrder';
import OrderDetails from '@/pages/orders/OrderDetails';
import SalesReports from '@/pages/reports/SalesReports';
import LeadReports from '@/pages/reports/LeadReports';
import PerformanceReports from '@/pages/reports/PerformanceReports';
import UserManagement from '@/pages/admin/UserManagement';
import ProductManagement from '@/pages/admin/ProductManagement';
import ImportData from '@/pages/admin/ImportData';
import Settings from '@/pages/admin/Settings';
import UserProfile from '@/pages/profile/UserProfile';

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
