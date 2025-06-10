
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import VisitPlannerPage from '@/pages/visits/VisitPlannerPage';
import TodaysVisitsPage from '@/pages/visits/TodaysVisitsPage';
import NewVisitPlanPage from '@/pages/visits/NewVisitPlanPage';
import VisitPlanDetailPage from '@/pages/visits/VisitPlanDetailPage';
import TaskOutcomePage from '@/pages/visits/TaskOutcomePage';

export const visitRoutes = [
  <Route key="visits" path="/visits" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <VisitPlannerPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="visits-today" path="/visits/today" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <TodaysVisitsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="visits-new" path="/visits/new" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NewVisitPlanPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="visits-plans-detail" path="/visits/plans/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <VisitPlanDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="visits-tasks-outcome" path="/visits/tasks/:id/outcome" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <TaskOutcomePage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
