
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import OrdersList from '@/pages/orders/OrdersPage';
import CreateOrder from '@/pages/orders/NewOrderPage';
import OrderDetails from '@/pages/orders/OrderDetailPage';

export const orderRoutes = (
  <>
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
  </>
);
