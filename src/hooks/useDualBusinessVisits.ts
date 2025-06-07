
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DualBusinessVisit {
  id: string;
  restaurant_id: string;
  visit_date: string;
  visit_type: 'gas_only' | 'uco_only' | 'combined';
  gas_objective?: string;
  gas_outcome?: string;
  gas_volume_sold?: number;
  gas_revenue?: number;
  uco_status?: 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed' | 'not_assessed';
  uco_collected_kg?: number;
  uco_price_paid?: number;
  uco_quality_score?: number;
  priority_level: string;
  collection_priority?: 'confirmed' | 'high' | 'medium' | 'low' | 'skip';
  visit_notes?: string;
  driver_notes?: string;
  next_visit_recommendation?: string;
  salesperson_uid: string;
  township?: string;
  route_sequence?: number;
  competitor_gas_info?: string;
  competitor_uco_info?: string;
  created_at: string;
  updated_at: string;
}

export const useDualBusinessVisits = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['dual-business-visits', restaurantId],
    queryFn: async () => {
      let query = supabase
        .from('dual_business_visits')
        .select(`
          *,
          restaurants!inner(name, township)
        `)
        .order('visit_date', { ascending: false });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createVisit = useMutation({
    mutationFn: async (visitData: Omit<DualBusinessVisit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dual_business_visits')
        .insert(visitData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dual-business-visits'] });
    },
  });

  const updateVisit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DualBusinessVisit> & { id: string }) => {
      const { data, error } = await supabase
        .from('dual_business_visits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dual-business-visits'] });
    },
  });

  // Bulk create visits from UCO collection plan
  const bulkCreateFromPlan = useMutation({
    mutationFn: async (planItems: any[]) => {
      const visits = planItems.map(item => ({
        restaurant_id: item.restaurant_id,
        visit_date: item.visit_time?.split('T')[0] || new Date().toISOString().split('T')[0],
        visit_type: 'uco_only' as const,
        uco_status: item.uco_status,
        collection_priority: item.collection_priority,
        route_sequence: item.route_sequence,
        salesperson_uid: item.created_by,
        township: item.restaurant?.township,
      }));

      const { data, error } = await supabase
        .from('dual_business_visits')
        .insert(visits)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dual-business-visits'] });
    },
  });

  return {
    visits,
    isLoading,
    createVisit,
    updateVisit,
    bulkCreateFromPlan,
  };
};
