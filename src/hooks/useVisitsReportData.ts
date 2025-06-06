
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface VisitsData {
  totalVisits: number;
  completedVisits: number;
  plannedVisits: number;
  completionRate: number;
  avgDuration: number;
  visitsByStatus: any[];
  visitsByTownship: any[];
  dailyVisits: any[];
  recentVisits: any[];
}

export const useVisitsReportData = (timeRange: string) => {
  const [data, setData] = useState<VisitsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVisitsData = async () => {
    try {
      setLoading(true);
      
      // Fetch visit data
      const { data: visits, error } = await supabase
        .from('visit_tasks_detailed')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalVisits = visits?.length || 0;
      const completedVisits = visits?.filter(v => v.status === 'VISITED').length || 0;
      const plannedVisits = visits?.filter(v => v.status === 'PLANNED').length || 0;
      const completionRate = totalVisits > 0 ? (Number(completedVisits) / Number(totalVisits)) * 100 : 0;

      // Average duration
      const visitsWithDuration = visits?.filter(v => v.estimated_duration_minutes) || [];
      const avgDuration = visitsWithDuration.length > 0
        ? visitsWithDuration.reduce((sum, v) => sum + (Number(v.estimated_duration_minutes) || 0), 0) / visitsWithDuration.length
        : 60;

      // Visits by status
      const statusCounts = visits?.reduce((acc: any, visit) => {
        const status = visit.status || 'PLANNED';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      const visitsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count,
        percentage: totalVisits > 0 ? ((count as number) / totalVisits * 100).toFixed(1) : 0
      }));

      // Visits by township
      const townshipCounts = visits?.reduce((acc: any, visit) => {
        const township = visit.township || 'Unknown';
        acc[township] = (acc[township] || 0) + 1;
        return acc;
      }, {}) || {};

      const visitsByTownship = Object.entries(townshipCounts)
        .map(([township, count]) => ({
          township,
          count: Number(count),
          percentage: totalVisits > 0 ? ((Number(count)) / totalVisits * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily visits for the last 7 days (mock data)
      const dailyVisits = [
        { date: 'Mon', visits: 12, completed: 8 },
        { date: 'Tue', visits: 15, completed: 12 },
        { date: 'Wed', visits: 18, completed: 14 },
        { date: 'Thu', visits: 20, completed: 16 },
        { date: 'Fri', visits: 22, completed: 18 },
        { date: 'Sat', visits: 8, completed: 6 },
        { date: 'Sun', visits: 5, completed: 4 }
      ];

      setData({
        totalVisits,
        completedVisits,
        plannedVisits,
        completionRate,
        avgDuration,
        visitsByStatus,
        visitsByTownship,
        dailyVisits,
        recentVisits: visits?.slice(0, 10) || []
      });

    } catch (error: any) {
      console.error('Error fetching visits data:', error);
      toast({
        title: "Error",
        description: "Failed to load visits data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitsData();
  }, [timeRange]);

  return { data, loading };
};
