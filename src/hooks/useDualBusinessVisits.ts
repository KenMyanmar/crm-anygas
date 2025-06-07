
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
  uco_status?: string;
  uco_collected_kg?: number;
  uco_price_paid?: number;
  uco_quality_score?: number;
  priority_level: string;
  visit_notes?: string;
  next_visit_recommendation?: string;
  salesperson_uid: string;
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

  return {
    visits,
    isLoading,
    createVisit,
    updateVisit,
  };
};
