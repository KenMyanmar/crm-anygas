
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import OrdersPage from '@/pages/orders/OrdersPage';
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import OrderEditPage from '@/pages/OrderEditPage';

export const orderRoutes = [
  <Route key="orders" path="/orders" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <OrdersPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="orders-new" path="/orders/new" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NewOrderPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="orders-detail" path="/orders/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <OrderDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="orders-edit" path="/orders/:id/edit" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <OrderEditPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
