
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import ReportsMainPage from '@/pages/reports/ReportsMainPage';
import OrdersSalesReportPage from '@/pages/reports/OrdersSalesReportPage';
import VisitsReportPage from '@/pages/reports/VisitsReportPage';
import RestaurantsReportPage from '@/pages/reports/RestaurantsReportPage';
import LeadReports from '@/pages/reports/LeadReportsPage';
import PerformanceReports from '@/pages/reports/PerformancePage';

export const reportRoutes = (
  <>
    <Route path="/reports" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <ReportsMainPage />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/reports/orders-sales" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <OrdersSalesReportPage />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/reports/visits" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <VisitsReportPage />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/reports/restaurants" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <RestaurantsReportPage />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/reports/leads" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <LeadReports />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/reports/performance" element={
      <ProtectedRoute>
        <ModernDashboardLayout>
          <PerformanceReports />
        </ModernDashboardLayout>
      </ProtectedRoute>
    } />
  </>
);
