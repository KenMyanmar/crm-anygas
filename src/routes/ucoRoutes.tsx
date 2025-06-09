
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UcoTrucksDashboard from '@/pages/uco/UcoTrucksDashboard';
import UcoCollectionPlanner from '@/pages/uco/UcoCollectionPlanner';
import UcoRouteOptimizer from '@/pages/uco/UcoRouteOptimizer';
import UcoMobileInterface from '@/pages/uco/UcoMobileInterface';
import UcoAnalytics from '@/pages/uco/UcoAnalytics';

export const ucoRoutes = (
  <>
    <Route path="/uco/dashboard" element={
      <DashboardLayout>
        <UcoTrucksDashboard />
      </DashboardLayout>
    } />
    <Route path="/uco/planner" element={
      <DashboardLayout>
        <UcoCollectionPlanner />
      </DashboardLayout>
    } />
    <Route path="/uco/routes" element={
      <DashboardLayout>
        <UcoRouteOptimizer />
      </DashboardLayout>
    } />
    <Route path="/uco/mobile" element={
      <DashboardLayout>
        <UcoMobileInterface />
      </DashboardLayout>
    } />
    <Route path="/uco/analytics" element={
      <DashboardLayout>
        <UcoAnalytics />
      </DashboardLayout>
    } />
  </>
);
