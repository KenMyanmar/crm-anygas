
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import LeadsPage from '@/pages/leads/LeadsPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import LeadEditPage from '@/pages/LeadEditPage';

export const leadRoutes = [
  <Route key="leads" path="/leads" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <LeadsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="leads-detail" path="/leads/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <LeadDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="leads-edit" path="/leads/:id/edit" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <LeadEditPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
