
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import LeadsPage from '@/pages/leads/LeadsPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import LeadEditPage from '@/pages/LeadEditPage';
import MeetingsPage from '@/pages/leads/MeetingsPage';
import NewMeetingPage from '@/pages/leads/NewMeetingPage';
import MeetingDetailPage from '@/pages/leads/MeetingDetailPage';

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
  } />,
  <Route key="meetings" path="/leads/meetings" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <MeetingsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="meetings-new" path="/leads/meetings/new" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NewMeetingPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="meetings-detail" path="/leads/meetings/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <MeetingDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
