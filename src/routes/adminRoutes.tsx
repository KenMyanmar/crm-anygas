
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UserManagement from '@/pages/admin/UsersPage';
import ProductManagement from '@/pages/admin/ProductsPage';
import ImportData from '@/pages/admin/ImportPage';
import RestaurantManagementPage from '@/pages/admin/RestaurantManagementPage';
import Settings from '@/pages/SettingsPage';

export const adminRoutes = (
  <>
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
    <Route path="/admin/restaurants" element={
      <DashboardLayout>
        <RestaurantManagementPage />
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
  </>
);
