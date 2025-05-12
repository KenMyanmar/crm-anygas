
import React, { useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Dashboard = () => {
  const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardData();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Log dashboard data state for debugging
    console.log('Dashboard render state:', { 
      hasData: !!dashboardData,
      isLoading,
      error,
      leadSummaryLength: dashboardData?.leadSummary?.length,
      upcomingActionsLength: dashboardData?.upcomingActions?.length,
      activitiesLength: dashboardData?.recentActivity?.length,
      notificationsLength: dashboardData?.notifications?.length
    });
  }, [dashboardData, isLoading, error]);

  // Handle notification mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      console.log('Marking notification as read:', id);
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) {
        console.error('Failed to mark notification as read:', error);
        toast({
          title: "Error",
          description: "Could not mark notification as read",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
      
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
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Handle empty data state
  const isEmpty = 
    (!dashboardData?.leadSummary || dashboardData.leadSummary.length === 0) &&
    (!dashboardData?.upcomingActions || dashboardData.upcomingActions.length === 0) &&
    (!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) &&
    (!dashboardData?.notifications || dashboardData.notifications.length === 0);

  if (isEmpty && !isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader onRefresh={fetchDashboardData} />
        
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Dashboard Data</AlertTitle>
          <AlertDescription>
            Your dashboard is empty. This might be because you haven't been assigned any leads yet
            or there is no activity in the system. Contact your administrator if you believe this is a mistake.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={fetchDashboardData} />
      
      {dashboardData?.leadSummary && dashboardData.leadSummary.length > 0 ? (
        <LeadSummary statusCounts={dashboardData.leadSummary} />
      ) : (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Lead Summary</AlertTitle>
          <AlertDescription>
            There are no leads assigned to you yet.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData?.upcomingActions && (
          <UpcomingActions 
            actions={dashboardData.upcomingActions} 
            onActionClick={(leadId) => navigate(`/leads/${leadId}`)}
          />
        )}
        <div className="space-y-6">
          {dashboardData?.recentActivity && (
            <ActivityFeed activities={dashboardData.recentActivity} />
          )}
          {dashboardData?.notifications && (
            <NotificationsCard 
              notifications={dashboardData.notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
