
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface LeadAnalyticsData {
  totalLeads: number;
  conversionRate: number;
  avgDealValue: number;
  pipelineVelocity: number;
  leadsByStatus: Array<{ status: string; count: number; percentage: number }>;
  leadsBySource: Array<{ source: string; count: number; percentage: number }>;
  conversionFunnel: Array<{ stage: string; count: number; conversionRate: number }>;
  performanceBySalesperson: Array<{ 
    name: string; 
    leadsCount: number; 
    conversions: number; 
    conversionRate: number; 
  }>;
  leadsByTownship: Array<{ township: string; count: number; percentage: number }>;
  trendData: Array<{ date: string; newLeads: number; conversions: number }>;
  recentActivity: Array<{
    id: string;
    leadName: string;
    status: string;
    assignedTo: string;
    updatedAt: string;
  }>;
}

export const useLeadAnalytics = (timeRange: string = '30') => {
  const [data, setData] = useState<LeadAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch leads data
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          restaurant:restaurants(name, township),
          assigned_user:users!leads_assigned_to_user_id_fkey(full_name)
        `)
        .gte('created_at', startDate.toISOString());

      if (leadsError) throw leadsError;

      const leads = leadsData || [];
      const totalLeads = leads.length;

      // Calculate metrics
      const wonLeads = leads.filter(lead => lead.status === 'WON').length;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      // Leads by status
      const statusCounts = leads.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace(/_/g, ' '),
        count: count as number,
        percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
      }));

      // Leads by source
      const sourceCounts = leads.reduce((acc: any, lead) => {
        const source = lead.source || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const leadsBySource = Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count: count as number,
        percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
      }));

      // Performance by salesperson
      const salespersonPerformance = leads.reduce((acc: any, lead) => {
        const name = lead.assigned_user?.full_name || 'Unassigned';
        if (!acc[name]) {
          acc[name] = { leadsCount: 0, conversions: 0 };
        }
        acc[name].leadsCount++;
        if (lead.status === 'WON') {
          acc[name].conversions++;
        }
        return acc;
      }, {});

      const performanceBySalesperson = Object.entries(salespersonPerformance).map(([name, data]: [string, any]) => ({
        name,
        leadsCount: data.leadsCount,
        conversions: data.conversions,
        conversionRate: data.leadsCount > 0 ? (data.conversions / data.leadsCount) * 100 : 0
      }));

      // Leads by township
      const townshipCounts = leads.reduce((acc: any, lead) => {
        const township = lead.restaurant?.township || 'Unknown';
        acc[township] = (acc[township] || 0) + 1;
        return acc;
      }, {});

      const leadsByTownship = Object.entries(townshipCounts).map(([township, count]) => ({
        township,
        count: count as number,
        percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
      }));

      // Conversion funnel
      const stages = ['NEW', 'CONTACTED', 'NEEDS_FOLLOW_UP', 'WON', 'LOST'];
      const conversionFunnel = stages.map((stage, index) => {
        const count = leads.filter(lead => lead.status === stage).length;
        const prevStageCount = index > 0 ? leads.filter(lead => 
          stages.slice(0, index + 1).includes(lead.status)
        ).length : totalLeads;
        
        return {
          stage: stage.replace(/_/g, ' '),
          count,
          conversionRate: prevStageCount > 0 ? (count / prevStageCount) * 100 : 0
        };
      });

      // Trend data (simplified for now)
      const trendData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayLeads = leads.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate.toDateString() === date.toDateString();
        });
        
        return {
          date: date.toISOString().split('T')[0],
          newLeads: dayLeads.length,
          conversions: dayLeads.filter(lead => lead.status === 'WON').length
        };
      });

      // Recent activity
      const recentActivity = leads
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10)
        .map(lead => ({
          id: lead.id,
          leadName: lead.name,
          status: lead.status.replace(/_/g, ' '),
          assignedTo: lead.assigned_user?.full_name || 'Unassigned',
          updatedAt: lead.updated_at
        }));

      setData({
        totalLeads,
        conversionRate,
        avgDealValue: 0, // Placeholder
        pipelineVelocity: 0, // Placeholder
        leadsByStatus,
        leadsBySource,
        conversionFunnel,
        performanceBySalesperson,
        leadsByTownship,
        trendData,
        recentActivity
      });

    } catch (err: any) {
      console.error('Error fetching lead analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return { data, loading, error, refetch: fetchAnalytics };
};
