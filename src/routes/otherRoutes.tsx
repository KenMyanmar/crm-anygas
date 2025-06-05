
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Notifications from '@/pages/Notifications';
import UserProfile from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';

export const otherRoutes = (
  <>
    <Route path="/notifications" element={
      <DashboardLayout>
        <Notifications />
      </DashboardLayout>
    } />
    <Route path="/profile" element={
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    } />
    <Route path="*" element={<NotFound />} />
  </>
);
