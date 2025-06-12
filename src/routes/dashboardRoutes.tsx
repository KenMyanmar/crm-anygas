import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import Dashboard from '@/pages/Dashboard';
import CalendarPage from '@/components/calendar/CalendarPage';
import TasksPage from '@/components/tasks/TasksPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/Notifications';

export const dashboardRoutes = [
  <Route key="dashboard" path="/" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <Dashboard />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  
  <Route key="profile" path="/profile" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <ProfilePage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  
  <Route key="calendar" path="/calendar" element={
    <ProtectedRoute>
      <CalendarPage />
    </ProtectedRoute>
  } />,
  
  <Route key="tasks" path="/tasks" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <TasksPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,

  <Route key="settings" path="/settings" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <SettingsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,

  <Route key="admin" path="/admin" element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  } />,
  
  <Route key="notifications" path="/notifications" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NotificationsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
