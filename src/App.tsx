
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Auth pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";

// Main pages
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
      retry: 1, // Reduce retry attempts to prevent excessive requests
      staleTime: 10000, // 10 seconds
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Main Routes - Use Index as the root route handler */}
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} /> {/* Redirect /dashboard to root */}
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/import" element={<ImportPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            
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
