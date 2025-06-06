
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ReportsMainPage from '@/pages/reports/ReportsMainPage';
import OrdersSalesReportPage from '@/pages/reports/OrdersSalesReportPage';
import VisitsReportPage from '@/pages/reports/VisitsReportPage';
import RestaurantsReportPage from '@/pages/reports/RestaurantsReportPage';
import LeadReports from '@/pages/reports/LeadReportsPage';
import PerformanceReports from '@/pages/reports/PerformancePage';

export const reportRoutes = (
  <>
    <Route path="/reports" element={
      <DashboardLayout>
        <ReportsMainPage />
      </DashboardLayout>
    } />
    <Route path="/reports/orders-sales" element={
      <DashboardLayout>
        <OrdersSalesReportPage />
      </DashboardLayout>
    } />
    <Route path="/reports/visits" element={
      <DashboardLayout>
        <VisitsReportPage />
      </DashboardLayout>
    } />
    <Route path="/reports/restaurants" element={
      <DashboardLayout>
        <RestaurantsReportPage />
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
