
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DashboardError from '@/components/dashboard/DashboardError';
import LeadSummary from '@/components/dashboard/LeadSummary';
import UpcomingActions from '@/components/dashboard/UpcomingActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardData();
  const navigate = useNavigate();

  // Handle notification mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) {
        console.error('Failed to mark notification as read:', error);
        return;
      }
      
      // Refresh dashboard data to update the UI
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  // Error state
  if (error && !dashboardData) {
    return <DashboardError error={error} onRetry={fetchDashboardData} />;
  }

  // Loading state
  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={fetchDashboardData} />
      
      <LeadSummary statusCounts={dashboardData.leadSummary} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingActions 
          actions={dashboardData.upcomingActions} 
          onActionClick={(leadId) => navigate(`/leads/${leadId}`)}
        />
        <div className="space-y-6">
          <ActivityFeed activities={dashboardData.recentActivity} />
          <NotificationsCard 
            notifications={dashboardData.notifications}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
