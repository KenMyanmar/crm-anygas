
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import VisitPlanner from '@/pages/visits/VisitPlannerPage';
import TodayVisits from '@/pages/visits/TodaysVisitsPage';
import CreateVisit from '@/pages/visits/NewVisitPlanPage';
import VisitPlanDetailPage from '@/pages/visits/VisitPlanDetailPage';
import TaskOutcomePage from '@/pages/visits/TaskOutcomePage';

export const visitRoutes = (
  <>
    <Route path="/visits" element={
      <DashboardLayout>
        <VisitPlanner />
      </DashboardLayout>
    } />
    <Route path="/visits/today" element={
      <DashboardLayout>
        <TodayVisits />
      </DashboardLayout>
    } />
    <Route path="/visits/new" element={
      <DashboardLayout>
        <CreateVisit />
      </DashboardLayout>
    } />
    <Route path="/visits/plans/:id" element={
      <DashboardLayout>
        <VisitPlanDetailPage />
      </DashboardLayout>
    } />
    <Route path="/visits/tasks/:id/outcome" element={
      <DashboardLayout>
        <TaskOutcomePage />
      </DashboardLayout>
    } />
  </>
);
