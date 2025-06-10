
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import UcoDashboardPage from '@/pages/uco/UcoCollectionDashboard';
import UcoCollectionPlanDetailPage from '@/pages/uco/UcoCollectionPlanDetailPage';
import UcoRouteOptimizationPage from '@/pages/uco/UcoRouteOptimizer';

export const ucoRoutes = [
  <Route key="uco-dashboard" path="/uco/dashboard" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoDashboardPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-plans-detail" path="/uco/plans/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoCollectionPlanDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-routes" path="/uco/routes" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoRouteOptimizationPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
