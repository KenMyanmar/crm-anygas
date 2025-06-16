
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LeadsPage from '@/pages/leads/LeadsPage';
import AssignedLeadsPage from '@/pages/leads/AssignedLeadsPage';
import NewLeadPage from '@/pages/leads/NewLeadPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import LeadEditPage from '@/pages/LeadEditPage';
import MeetingsPage from '@/pages/leads/MeetingsPage';
import NewMeetingPage from '@/pages/leads/NewMeetingPage';
import MeetingDetailPage from '@/pages/leads/MeetingDetailPage';
import NewCallPage from '@/pages/leads/NewCallPage';
import CallDetailPage from '@/pages/leads/CallDetailPage';
import RestaurantLeadsPage from '@/pages/leads/RestaurantLeadsPage';

export const leadRoutes = (
  <>
    <Route path="/leads" element={
      <ProtectedRoute>
        <DashboardLayout>
          <LeadsPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/leads/assigned" element={
      <ProtectedRoute>
        <DashboardLayout>
          <AssignedLeadsPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/leads/new" element={
      <ProtectedRoute>
        <DashboardLayout>
          <NewLeadPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/leads/:id" element={
      <ProtectedRoute>
        <DashboardLayout>
          <LeadDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/leads/:id/edit" element={
      <ProtectedRoute>
        <DashboardLayout>
          <LeadEditPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />

    <Route path="/leads/restaurant-discovery" element={
      <ProtectedRoute>
        <DashboardLayout>
          <RestaurantLeadsPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/meetings" element={
      <ProtectedRoute>
        <DashboardLayout>
          <MeetingsPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/meetings/new" element={
      <ProtectedRoute>
        <DashboardLayout>
          <NewMeetingPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/meetings/:id" element={
      <ProtectedRoute>
        <DashboardLayout>
          <MeetingDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/calls/new" element={
      <ProtectedRoute>
        <DashboardLayout>
          <NewCallPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/calls/:id" element={
      <ProtectedRoute>
        <DashboardLayout>
          <CallDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    } />
  </>
);
