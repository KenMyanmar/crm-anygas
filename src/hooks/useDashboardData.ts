
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashboardData } from '@/types';
import { supabase } from '@/lib/supabase';

export const useDashboardData = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the Supabase function to get dashboard data
      console.log('Fetching dashboard data for user:', profile?.id);
      const { data, error } = await supabase.rpc('get_my_dashboard_data');
      
      if (error) {
        throw error;
      }
      
      console.log('Dashboard data received:', data);
      
      // Transform the data to match our interface
      const transformedData: DashboardData = {
        leadSummary: data.leads_by_status?.map((item: any) => ({
          status: item.status,
          count: item.count
        })) || [],
        upcomingActions: data.upcoming_followups?.map((item: any) => ({
          id: item.id,
          restaurant_name: item.restaurant_name,
          next_action_description: item.next_action_description,
          next_action_date: item.next_action_date,
          status: item.status
        })) || [],
        recentActivity: data.recent_activities?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          target_id: item.target_id,
          target_type: item.target_type,
          activity_message: item.activity_message,
          created_at: item.created_at
        })) || [],
        notifications: data.user_notifications?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          message: item.message,
          link: item.link,
          read: item.read,
          created_at: item.created_at
        })) || []
      };
      
      setDashboardData(transformedData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      toast({
        title: "Error loading dashboard",
        description: error?.message || "Could not load dashboard data",
        variant: "destructive",
      });
      
      // Use mock data if there's an error in development
      if (import.meta.env.DEV) {
        console.log('Using mock data for development');
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  return { dashboardData, isLoading, error, fetchDashboardData };
};
