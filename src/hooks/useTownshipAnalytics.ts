
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TownshipAnalytics {
  township: string;
  total_restaurants: number;
  active_suppliers: number;
  potential_suppliers: number;
  avg_volume_per_restaurant: number;
  total_collected_last_30_days: number;
  visits_last_30_days: number;
}

export const useTownshipAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['township-uco-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('township_uco_analytics')
        .select('*');

      if (error) throw error;
      return data as TownshipAnalytics[];
    },
  });

  return {
    analytics,
    isLoading,
  };
};

export const useRestaurantsByTownship = (township?: string) => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants-by-township', township],
    queryFn: async () => {
      if (!township) return [];
      
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          recent_visits:dual_business_visits(
            visit_date,
            uco_status,
            uco_collected_kg,
            uco_quality_score
          )
        `)
        .eq('township', township)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!township,
  });

  return {
    restaurants,
    isLoading,
  };
};
