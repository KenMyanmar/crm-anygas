
import { Route } from 'react-router-dom';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import Dashboard from '@/pages/Dashboard';

export const dashboardRoutes = (
  <Route path="/" element={
    <ModernDashboardLayout>
      <Dashboard />
    </ModernDashboardLayout>
  } />
);
