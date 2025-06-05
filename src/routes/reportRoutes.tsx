
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SalesReports from '@/pages/placeholder/ReportsPage';
import LeadReports from '@/pages/reports/LeadReportsPage';
import PerformanceReports from '@/pages/reports/PerformancePage';

export const reportRoutes = (
  <>
    <Route path="/reports" element={
      <DashboardLayout>
        <SalesReports />
      </DashboardLayout>
    } />
    <Route path="/reports/leads" element={
      <DashboardLayout>
        <LeadReports />
      </DashboardLayout>
    } />
    <Route path="/reports/performance" element={
      <DashboardLayout>
        <PerformanceReports />
      </DashboardLayout>
    } />
  </>
);
