
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

  // Loading state - show this first
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state - only show if we have an error and no data
  if (error && !dashboardData) {
    return <DashboardError error={error} onRetry={fetchDashboardData} />;
  }

  // Handle empty data state - this happens when we have successfully loaded data but there's nothing to show
  const isEmpty = 
    (!dashboardData?.leadSummary || dashboardData.leadSummary.length === 0) &&
    (!dashboardData?.upcomingActions || dashboardData.upcomingActions.length === 0) &&
    (!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) &&
    (!dashboardData?.notifications || dashboardData.notifications.length === 0);

  // If we have no data but also no error, show empty state
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

  // If we have data, show the dashboard
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
        {dashboardData?.upcomingActions && dashboardData.upcomingActions.length > 0 ? (
          <UpcomingActions 
            actions={dashboardData.upcomingActions} 
            onActionClick={(leadId) => navigate(`/leads/${leadId}`)}
          />
        ) : (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Upcoming Actions</AlertTitle>
            <AlertDescription>
              You don't have any upcoming actions scheduled.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-6">
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <ActivityFeed activities={dashboardData.recentActivity} />
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No Recent Activity</AlertTitle>
              <AlertDescription>
                There has been no recent activity recorded.
              </AlertDescription>
            </Alert>
          )}
          {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
            <NotificationsCard 
              notifications={dashboardData.notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No Notifications</AlertTitle>
              <AlertDescription>
                You don't have any notifications at this time.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
