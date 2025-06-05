
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LeadsList from '@/pages/leads/LeadsPage';
import LeadDetails from '@/pages/RestaurantDetailPage';
import CreateLead from '@/pages/leads/NewLeadPage';
import EditLead from '@/pages/leads/NewLeadPage';
import AssignedLeads from '@/pages/leads/AssignedLeadsPage';
import LeadMeetings from '@/pages/leads/MeetingsPage';

export const leadRoutes = (
  <>
    <Route path="/leads" element={
      <DashboardLayout>
        <LeadsList />
      </DashboardLayout>
    } />
    <Route path="/leads/:id" element={
      <DashboardLayout>
        <LeadDetails />
      </DashboardLayout>
    } />
    <Route path="/leads/new" element={
      <DashboardLayout>
        <CreateLead />
      </DashboardLayout>
    } />
    <Route path="/leads/:id/edit" element={
      <DashboardLayout>
        <EditLead />
      </DashboardLayout>
    } />
    <Route path="/leads/assigned" element={
      <DashboardLayout>
        <AssignedLeads />
      </DashboardLayout>
    } />
    <Route path="/leads/meetings" element={
      <DashboardLayout>
        <LeadMeetings />
      </DashboardLayout>
    } />
  </>
);
