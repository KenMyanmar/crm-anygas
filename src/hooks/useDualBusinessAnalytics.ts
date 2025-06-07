
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DualBusinessMetrics {
  visitEfficiency: number;
  crossSellRate: number;
  avgCLV: number;
  gas: {
    totalRevenue: number;
    avgSaleSize: number;
    conversionRate: number;
    activeCustomers: number;
  };
  uco: {
    totalCollection: number;
    avgPricePerKg: number;
    activeSuppliers: number;
    qualityAverage: number;
  };
  combinedVisits: number;
  separateVisits: number;
}

export const useDualBusinessAnalytics = (timeRange: string = '30') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dual-business-analytics', timeRange],
    queryFn: async () => {
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get dual business visit stats
      const { data: visits, error: visitsError } = await supabase
        .from('dual_business_visits')
        .select('*')
        .gte('visit_date', startDate.toISOString().split('T')[0]);

      if (visitsError) throw visitsError;

      // Get restaurant business types
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('dual_business_restaurant_view')
        .select('*');

      if (restaurantsError) throw restaurantsError;

      // Calculate metrics
      const combinedVisits = visits.filter(v => v.visit_type === 'combined').length;
      const totalVisits = visits.length;
      const visitEfficiency = totalVisits > 0 ? (combinedVisits / totalVisits) * 100 : 0;

      // Gas metrics
      const gasVisits = visits.filter(v => v.gas_revenue && v.gas_revenue > 0);
      const totalGasRevenue = gasVisits.reduce((sum, v) => sum + (v.gas_revenue || 0), 0);
      const avgGasSale = gasVisits.length > 0 ? totalGasRevenue / gasVisits.length : 0;

      // UCO metrics
      const ucoVisits = visits.filter(v => v.uco_collected_kg && v.uco_collected_kg > 0);
      const totalUcoCollection = ucoVisits.reduce((sum, v) => sum + (v.uco_collected_kg || 0), 0);
      const avgUcoPrice = ucoVisits.length > 0 ? 
        ucoVisits.reduce((sum, v) => sum + (v.uco_price_paid || 0), 0) / ucoVisits.length : 0;

      // Cross-selling analysis
      const dualBusinessRestaurants = restaurants.filter(r => r.business_category === 'dual_business').length;
      const gasOnlyRestaurants = restaurants.filter(r => r.business_category === 'gas_only').length;
      const crossSellRate = gasOnlyRestaurants > 0 ? (dualBusinessRestaurants / gasOnlyRestaurants) * 100 : 0;

      // Quality metrics
      const qualityScores = ucoVisits.filter(v => v.uco_quality_score).map(v => v.uco_quality_score);
      const avgQuality = qualityScores.length > 0 ? 
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0;

      const metrics: DualBusinessMetrics = {
        visitEfficiency,
        crossSellRate,
        avgCLV: totalGasRevenue + (totalUcoCollection * avgUcoPrice),
        gas: {
          totalRevenue: totalGasRevenue,
          avgSaleSize: avgGasSale,
          conversionRate: visits.length > 0 ? (gasVisits.length / visits.length) * 100 : 0,
          activeCustomers: restaurants.filter(r => r.gas_revenue_last_30_days > 0).length,
        },
        uco: {
          totalCollection: totalUcoCollection,
          avgPricePerKg: avgUcoPrice,
          activeSuppliers: restaurants.filter(r => r.uco_collected_last_30_days > 0).length,
          qualityAverage: avgQuality,
        },
        combinedVisits,
        separateVisits: totalVisits - combinedVisits,
      };

      return metrics;
    },
  });

  return { data, isLoading, error };
};
