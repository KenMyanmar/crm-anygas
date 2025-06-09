
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UcoTruckRoute {
  id: string;
  plan_id: string;
  truck_id: string;
  driver_name?: string;
  route_date: string;
  start_location?: string;
  estimated_capacity_kg: number;
  actual_collected_kg: number;
  route_status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useUcoTruckRoutes = (planId?: string) => {
  const queryClient = useQueryClient();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['uco-truck-routes', planId],
    queryFn: async () => {
      let query = supabase.from('uco_truck_routes').select('*');
      
      if (planId) {
        query = query.eq('plan_id', planId);
      }
      
      const { data, error } = await query.order('route_date', { ascending: false });
      
      if (error) throw error;
      return data as UcoTruckRoute[];
    },
    enabled: !!planId,
  });

  const createRoute = useMutation({
    mutationFn: async (routeData: Omit<UcoTruckRoute, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('uco_truck_routes')
        .insert(routeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-truck-routes'] });
      toast.success('Truck route created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create truck route');
      console.error('Error creating route:', error);
    },
  });

  const updateRoute = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UcoTruckRoute> & { id: string }) => {
      const { data, error } = await supabase
        .from('uco_truck_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-truck-routes'] });
      toast.success('Route updated successfully');
    },
  });

  return {
    routes,
    isLoading,
    createRoute,
    updateRoute,
  };
};
