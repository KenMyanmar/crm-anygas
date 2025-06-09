
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import UcoTrucksDashboard from '@/pages/uco/UcoTrucksDashboard';
import UcoCollectionPlanner from '@/pages/uco/UcoCollectionPlanner';
import UcoRouteOptimizer from '@/pages/uco/UcoRouteOptimizer';
import UcoMobileInterface from '@/pages/uco/UcoMobileInterface';
import UcoAnalytics from '@/pages/uco/UcoAnalytics';
import NewUcoPlanPage from '@/pages/uco/NewUcoPlanPage';

export const ucoRoutes = (
  <>
    <Route path="/uco/dashboard" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <UcoTrucksDashboard />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/uco/planner" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <UcoCollectionPlanner />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/uco/planner/new" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <NewUcoPlanPage />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/uco/routes" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <UcoRouteOptimizer />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/uco/mobile" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <UcoMobileInterface />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/uco/analytics" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <UcoAnalytics />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
  </>
);
