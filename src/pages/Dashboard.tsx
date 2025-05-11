
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LeadSummary from '@/components/dashboard/LeadSummary';
import UpcomingActions from '@/components/dashboard/UpcomingActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import { DashboardData } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    leadSummary: [],
    upcomingActions: [],
    recentActivity: [],
    notifications: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Call the Supabase function to get dashboard data
        const { data, error } = await supabase.rpc('get_my_dashboard_data');
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our interface
        const transformedData: DashboardData = {
          leadSummary: data.lead_summary.map((item: any) => ({
            status: item.status,
            count: item.count
          })),
          upcomingActions: data.upcoming_actions.map((item: any) => ({
            id: item.id,
            restaurant_name: item.restaurant_name,
            next_action_description: item.next_action_description,
            next_action_date: item.next_action_date,
            status: item.status
          })),
          recentActivity: data.recent_activity.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            target_id: item.target_id,
            target_type: item.target_type,
            activity_message: item.activity_message,
            created_at: item.created_at
          })),
          notifications: data.notifications.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            title: item.title,
            message: item.message,
            link: item.link,
            read: item.read,
            created_at: item.created_at
          }))
        };
        
        setDashboardData(transformedData);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: error?.message || "Could not load dashboard data",
          variant: "destructive",
        });
        
        // Use mock data if there's an error
        setDashboardData({
          leadSummary: [
            { status: 'NEW', count: 12 },
            { status: 'CONTACTED', count: 28 },
            { status: 'NEEDS_FOLLOW_UP', count: 8 },
            { status: 'TRIAL', count: 5 },
            { status: 'WON', count: 34 }
          ],
          upcomingActions: [
            {
              id: '1',
              restaurant_name: 'Golden Palace Restaurant',
              next_action_description: 'Follow-up call regarding cylinder delivery',
              next_action_date: new Date().toISOString(),
              status: 'NEEDS_FOLLOW_UP'
            },
            {
              id: '2',
              restaurant_name: 'Silver Spoon Café',
              next_action_description: 'Arrange demo for new gas equipment',
              next_action_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
              status: 'TRIAL'
            },
            {
              id: '3',
              restaurant_name: 'Yangon Tastes',
              next_action_description: 'Confirm pricing for bulk order',
              next_action_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
              status: 'NEGOTIATION'
            }
          ],
          recentActivity: [
            {
              id: '1',
              activity_message: 'Added new lead for Golden Palace Restaurant',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              target_type: 'LEAD'
            },
            {
              id: '2',
              activity_message: 'Logged call with Silver Spoon Café manager',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              target_type: 'CALL_LOG'
            },
            {
              id: '3',
              activity_message: 'Created new order #1234 for Yangon Tastes',
              created_at: new Date(Date.now() - 10800000).toISOString(),
              target_type: 'ORDER'
            }
          ],
          notifications: [
            {
              id: '1',
              user_id: profile?.id || '',
              title: 'New Lead Assigned',
              message: 'You have been assigned a new lead for Ocean View Restaurant',
              link: '/leads/4',
              read: false,
              created_at: new Date(Date.now() - 1800000).toISOString()
            },
            {
              id: '2',
              user_id: profile?.id || '',
              title: 'Order Confirmed',
              message: 'Order #5678 for Golden Palace has been confirmed',
              link: '/orders/5678',
              read: false,
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: '3',
              user_id: profile?.id || '',
              title: 'Follow-up Reminder',
              message: 'Due follow-up with Silver Spoon Café',
              link: '/leads/2',
              read: true,
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        
        <LeadSummary statusCounts={dashboardData.leadSummary} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingActions actions={dashboardData.upcomingActions} />
          <div className="space-y-6">
            <ActivityFeed activities={dashboardData.recentActivity} />
            <NotificationsCard notifications={dashboardData.notifications} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
