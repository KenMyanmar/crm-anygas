
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import AuthWrapper from './components/AuthWrapper';

// Auth pages (no auth required)
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import SettingsPage from './pages/SettingsPage';

// Leads pages
import LeadsPage from './pages/leads/LeadsPage';
import AssignedLeadsPage from './pages/leads/AssignedLeadsPage';
import NewLeadPage from './pages/leads/NewLeadPage';
import MeetingsPage from './pages/leads/MeetingsPage';

// Admin pages
import UsersPage from './pages/admin/UsersPage';
import ProductsPage from './pages/admin/ProductsPage';
import ImportPage from './pages/admin/ImportPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

// Orders pages
import OrdersPage from './pages/orders/OrdersPage';
import PendingOrdersPage from './pages/orders/PendingOrdersPage';
import DeliveredOrdersPage from './pages/orders/DeliveredOrdersPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';

// Restaurants pages
import NewRestaurantPage from './pages/restaurants/NewRestaurantPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import RestaurantEditPage from './pages/RestaurantEditPage';

// Reports pages
import LeadReportsPage from './pages/reports/LeadReportsPage';
import PerformancePage from './pages/reports/PerformancePage';

// Placeholder pages
import RestaurantsPage from './pages/placeholder/RestaurantsPage';
import ReportsPage from './pages/placeholder/ReportsPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes - no auth required */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/" element={
              <AuthWrapper>
                <Dashboard />
              </AuthWrapper>
            } />
            
            <Route path="/profile" element={
              <AuthWrapper>
                <ProfilePage />
              </AuthWrapper>
            } />
            
            <Route path="/notifications" element={
              <AuthWrapper>
                <Notifications />
              </AuthWrapper>
            } />
            
            <Route path="/settings" element={
              <AuthWrapper>
                <SettingsPage />
              </AuthWrapper>
            } />

            {/* Leads routes */}
            <Route path="/leads" element={
              <AuthWrapper>
                <LeadsPage />
              </AuthWrapper>
            } />
            
            <Route path="/leads/assigned" element={
              <AuthWrapper>
                <AssignedLeadsPage />
              </AuthWrapper>
            } />
            
            <Route path="/leads/new" element={
              <AuthWrapper>
                <NewLeadPage />
              </AuthWrapper>
            } />
            
            <Route path="/leads/meetings" element={
              <AuthWrapper>
                <MeetingsPage />
              </AuthWrapper>
            } />

            {/* Admin routes */}
            <Route path="/admin/users" element={
              <AuthWrapper>
                <UsersPage />
              </AuthWrapper>
            } />
            
            <Route path="/admin/products" element={
              <AuthWrapper>
                <ProductsPage />
              </AuthWrapper>
            } />
            
            <Route path="/admin/import" element={
              <AuthWrapper>
                <ImportPage />
              </AuthWrapper>
            } />
            
            <Route path="/admin/settings" element={
              <AuthWrapper>
                <AdminSettingsPage />
              </AuthWrapper>
            } />

            {/* Orders routes */}
            <Route path="/orders" element={
              <AuthWrapper>
                <OrdersPage />
              </AuthWrapper>
            } />
            
            <Route path="/orders/pending" element={
              <AuthWrapper>
                <PendingOrdersPage />
              </AuthWrapper>
            } />
            
            <Route path="/orders/delivered" element={
              <AuthWrapper>
                <DeliveredOrdersPage />
              </AuthWrapper>
            } />
            
            <Route path="/orders/new" element={
              <AuthWrapper>
                <NewOrderPage />
              </AuthWrapper>
            } />
            
            <Route path="/orders/:id" element={
              <AuthWrapper>
                <OrderDetailPage />
              </AuthWrapper>
            } />

            {/* Restaurants routes */}
            <Route path="/restaurants" element={
              <AuthWrapper>
                <RestaurantsPage />
              </AuthWrapper>
            } />
            
            <Route path="/restaurants/new" element={
              <AuthWrapper>
                <NewRestaurantPage />
              </AuthWrapper>
            } />
            
            <Route path="/restaurants/:id" element={
              <AuthWrapper>
                <RestaurantDetailPage />
              </AuthWrapper>
            } />
            
            <Route path="/restaurants/:id/edit" element={
              <AuthWrapper>
                <RestaurantEditPage />
              </AuthWrapper>
            } />

            {/* Reports routes */}
            <Route path="/reports" element={
              <AuthWrapper>
                <ReportsPage />
              </AuthWrapper>
            } />
            
            <Route path="/reports/leads" element={
              <AuthWrapper>
                <LeadReportsPage />
              </AuthWrapper>
            } />
            
            <Route path="/reports/performance" element={
              <AuthWrapper>
                <PerformancePage />
              </AuthWrapper>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
