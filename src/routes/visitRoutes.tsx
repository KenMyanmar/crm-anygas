
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import VisitPlanner from '@/pages/visits/VisitPlannerPage';
import TodayVisits from '@/pages/visits/TodaysVisitsPage';
import CreateVisit from '@/pages/visits/NewVisitPlanPage';

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
  </>
);
