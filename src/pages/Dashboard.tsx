
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DashboardError from '@/components/dashboard/DashboardError';
import MyanmarInsightsCards from '@/components/dashboard/MyanmarInsightsCards';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon } from 'lucide-react';
import TaskList from '@/components/dashboard/TaskList';
import LeadTable from '@/components/dashboard/LeadTable';
import StatsSummary from '@/components/dashboard/StatsSummary';
import ActivityTable from '@/components/dashboard/ActivityTable';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

const Dashboard = () => {
  const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log('Dashboard render state:', { 
      hasData: !!dashboardData,
      isLoading,
      error,
      leadSummaryLength: dashboardData?.lead_summary?.length,
      upcomingActionsLength: dashboardData?.upcoming_actions?.length,
      activitiesLength: dashboardData?.recent_activity?.length,
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
      fetchDashboardData(true);
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state - only show if we have an error and no data
  if (error && !dashboardData) {
    return <DashboardError error={error} onRetry={() => fetchDashboardData(true)} />;
  }

  // Handle empty data state
  const isEmpty = 
    (!dashboardData?.lead_summary || dashboardData.lead_summary.length === 0) &&
    (!dashboardData?.upcoming_actions || dashboardData.upcoming_actions.length === 0) &&
    (!dashboardData?.recent_activity || dashboardData.recent_activity.length === 0) &&
    (!dashboardData?.notifications || dashboardData.notifications.length === 0);

  // If we have no data but also no error, show empty state
  if (isEmpty && !isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader onRefresh={() => fetchDashboardData(true)} />
        
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
      <DashboardHeader onRefresh={() => fetchDashboardData(true)} />
      
      {/* Myanmar Business Intelligence Cards */}
      <MyanmarInsightsCards dashboardData={dashboardData} />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">My Leads</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Summary Cards */}
          {dashboardData?.lead_summary && dashboardData.lead_summary.length > 0 && (
            <StatsSummary statusCounts={dashboardData.lead_summary} />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tasks Panel */}
            <div className="lg:col-span-5">
              {dashboardData?.upcoming_actions && dashboardData.upcoming_actions.length > 0 ? (
                <TaskList 
                  tasks={dashboardData.upcoming_actions} 
                  onTaskClick={(leadId) => navigate(`/leads/${leadId}`)}
                />
              ) : (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Tasks</AlertTitle>
                  <AlertDescription>
                    You don't have any upcoming tasks scheduled.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Recent Activity Panel */}
            <div className="lg:col-span-4">
              {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                <ActivityTable activities={dashboardData.recent_activity} />
              ) : (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Recent Activity</AlertTitle>
                  <AlertDescription>
                    There has been no recent activity recorded.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Notifications Panel */}
            <div className="lg:col-span-3">
              {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
                <NotificationsPanel 
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
        </TabsContent>
        
        <TabsContent value="leads">
          {dashboardData?.lead_summary && (
            <LeadTable upcomingActions={dashboardData.upcoming_actions || []} />
          )}
        </TabsContent>
        
        <TabsContent value="tasks">
          {dashboardData?.upcoming_actions && dashboardData.upcoming_actions.length > 0 ? (
            <TaskList 
              tasks={dashboardData.upcoming_actions} 
              onTaskClick={(leadId) => navigate(`/leads/${leadId}`)}
              showFilters={true}
            />
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No Tasks</AlertTitle>
              <AlertDescription>
                You don't have any upcoming tasks scheduled.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
            <ActivityTable 
              activities={dashboardData.recent_activity} 
              showFilters={true}
            />
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No Activity</AlertTitle>
              <AlertDescription>
                There has been no recent activity recorded.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
