import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/placeholder/LeadsPage";
import RestaurantsPage from "./pages/placeholder/RestaurantsPage";
import OrdersPage from "./pages/placeholder/OrdersPage";
import ReportsPage from "./pages/placeholder/ReportsPage";

// Admin pages
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import ImportPage from "./pages/admin/ImportPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Other pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
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
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurants" 
              element={
                <ProtectedRoute>
                  <RestaurantsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <ReportsPage />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
