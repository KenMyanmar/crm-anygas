import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashboardData, LeadStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';

let dashboardDataCache: DashboardData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useDashboardData = () => {
  const { profile } = useAuth();
  const { notifications } = useNotifications();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(dashboardDataCache);
  const [isLoading, setIsLoading] = useState(!dashboardDataCache);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now();
    if (!forceRefresh && dashboardDataCache && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('Using cached dashboard data');
      setDashboardData(dashboardDataCache);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching fresh dashboard data');
      
      const { data, error } = await supabase.rpc('get_my_dashboard_data');
      
      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('No dashboard data returned from the RPC function');
        const emptyData: DashboardData = {
          lead_summary: [],
          upcoming_actions: [],
          recent_activity: [],
          notifications: notifications || []
        };
        setDashboardData(emptyData);
        dashboardDataCache = emptyData;
        lastFetchTime = now;
        return;
      }
      
      // Transform the data to match our interface, but use notifications from context
      const transformedData: DashboardData = {
        lead_summary: Array.isArray(data.leads_by_status) ? data.leads_by_status.map((item: any) => ({
          status: item.status as LeadStatus,
          count: item.count
        })) : [],
        upcoming_actions: Array.isArray(data.upcoming_followups) ? data.upcoming_followups.map((item: any) => ({
          id: item.id,
          restaurant_name: item.restaurant_name,
          next_action_description: item.next_action_description,
          next_action_date: item.next_action_date,
          status: item.status as LeadStatus
        })) : [],
        recent_activity: Array.isArray(data.recent_activities) ? data.recent_activities.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          target_id: item.target_id,
          target_type: item.target_type,
          activity_message: item.activity_message,
          created_at: item.created_at
        })) : [],
        notifications: notifications || []
      };
      
      console.log('Dashboard data loaded successfully');
      setDashboardData(transformedData);
      dashboardDataCache = transformedData;
      lastFetchTime = now;
      
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
        const mockData: DashboardData = {
          lead_summary: [
            { status: 'CONTACT_STAGE', count: 12 },
            { status: 'MEETING_STAGE', count: 8 },
            { status: 'PRESENTATION_NEGOTIATION', count: 5 },
            { status: 'CLOSED_WON', count: 34 },
            { status: 'CLOSED_LOST', count: 12 }
          ],
          upcoming_actions: [
            {
              id: '1',
              restaurant_name: 'Golden Palace Restaurant',
              next_action_description: 'Follow-up call regarding cylinder delivery',
              next_action_date: new Date().toISOString(),
              status: 'CONTACT_STAGE'
            },
            {
              id: '2',
              restaurant_name: 'Silver Spoon Café',
              next_action_description: 'Arrange demo for new gas equipment',
              next_action_date: new Date(Date.now() + 86400000).toISOString(),
              status: 'MEETING_STAGE'
            }
          ],
          recent_activity: [
            {
              id: '1',
              activity_message: 'Added new lead for Golden Palace Restaurant',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              target_type: 'LEAD'
            }
          ],
          notifications: notifications || []
        };
        setDashboardData(mockData);
        dashboardDataCache = mockData;
        lastFetchTime = now;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update dashboard data when notifications change
  useEffect(() => {
    if (dashboardData && notifications) {
      setDashboardData(prev => prev ? { ...prev, notifications } : null);
    }
  }, [notifications, dashboardData]);

  useEffect(() => {
    if (profile && !dashboardDataCache) {
      fetchDashboardData();
    } else if (!profile) {
      setDashboardData(null);
      dashboardDataCache = null;
      setIsLoading(false);
    }
  }, [profile]);

  return { 
    dashboardData, 
    isLoading, 
    error, 
    fetchDashboardData: (forceRefresh = false) => fetchDashboardData(forceRefresh)
  };
};
