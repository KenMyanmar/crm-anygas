
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import UcoDashboardPage from '@/pages/uco/UcoCollectionDashboard';
import UcoCollectionPlanDetailPage from '@/pages/uco/UcoCollectionPlanDetailPage';
import UcoRouteOptimizationPage from '@/pages/uco/UcoRouteOptimizer';
import UcoCollectionPlanner from '@/pages/uco/UcoCollectionPlanner';
import UcoMobileInterface from '@/pages/uco/UcoMobileInterface';
import UcoAnalytics from '@/pages/uco/UcoAnalytics';
import NewUcoPlanPage from '@/pages/uco/NewUcoPlanPage';

export const ucoRoutes = [
  <Route key="uco-dashboard" path="/uco/dashboard" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoDashboardPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-planner" path="/uco/planner" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoCollectionPlanner />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-planner-new" path="/uco/planner/new" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NewUcoPlanPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-mobile" path="/uco/mobile" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoMobileInterface />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-analytics" path="/uco/analytics" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoAnalytics />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-routes" path="/uco/routes" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoRouteOptimizationPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="uco-plans-detail" path="/uco/plans/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <UcoCollectionPlanDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
