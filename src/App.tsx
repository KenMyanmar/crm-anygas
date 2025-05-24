
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SidebarProvider } from "./components/ui/sidebar";

// Auth pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import NotificationsPage from "./pages/Notifications";
import LeadsPage from "./pages/placeholder/LeadsPage";
import RestaurantsPage from "./pages/placeholder/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import RestaurantEditPage from "./pages/RestaurantEditPage";
import OrdersPage from "./pages/orders/OrdersPage";
import NewOrderPage from "./pages/orders/NewOrderPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ReportsPage from "./pages/placeholder/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// Lead management pages
import AssignedLeadsPage from "./pages/leads/AssignedLeadsPage";
import CallLogPage from "./pages/leads/CallLogPage";
import MeetingsPage from "./pages/leads/MeetingsPage";
import NewLeadPage from "./pages/leads/NewLeadPage";

// Order management pages
import PendingOrdersPage from "./pages/orders/PendingOrdersPage";
import DeliveredOrdersPage from "./pages/orders/DeliveredOrdersPage";

// Report pages
import LeadReportsPage from "./pages/reports/LeadReportsPage";
import PerformancePage from "./pages/reports/PerformancePage";

// Admin pages
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import ImportPage from "./pages/admin/ImportPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Other pages
import NotFound from "./pages/NotFound";

// Create query client outside of the component to avoid issues with React hooks
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Public Routes (accessible without authentication) */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes (require authentication) */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile and Settings Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Notifications Route */}
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Leads Routes */}
              <Route 
                path="/leads" 
                element={
                  <ProtectedRoute>
                    <LeadsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/new" 
                element={
                  <ProtectedRoute>
                    <NewLeadPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/assigned" 
                element={
                  <ProtectedRoute>
                    <AssignedLeadsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/calls" 
                element={
                  <ProtectedRoute>
                    <CallLogPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/meetings" 
                element={
                  <ProtectedRoute>
                    <MeetingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Restaurants Routes */}
              <Route 
                path="/restaurants" 
                element={
                  <ProtectedRoute>
                    <RestaurantsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/restaurants/:id" 
                element={
                  <ProtectedRoute>
                    <RestaurantDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/restaurants/:id/edit" 
                element={
                  <ProtectedRoute>
                    <RestaurantEditPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Orders Routes */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/new" 
                element={
                  <ProtectedRoute>
                    <NewOrderPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/pending" 
                element={
                  <ProtectedRoute>
                    <PendingOrdersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/delivered" 
                element={
                  <ProtectedRoute>
                    <DeliveredOrdersPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Reports Routes */}
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/leads" 
                element={
                  <ProtectedRoute>
                    <LeadReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/performance" 
                element={
                  <ProtectedRoute>
                    <PerformancePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/import" 
                element={
                  <ProtectedRoute>
                    <ImportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all for undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
