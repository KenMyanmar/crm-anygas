
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UcoCollectionPlan {
  id: string;
  plan_name: string;
  townships: string[];
  plan_date: string;
  driver_name?: string;
  truck_capacity_kg: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UcoCollectionItem {
  id: string;
  plan_id: string;
  restaurant_id: string;
  route_sequence: number;
  uco_status: 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed' | 'not_assessed';
  collection_priority: 'confirmed' | 'high' | 'medium' | 'low' | 'skip';
  expected_volume_kg?: number;
  actual_volume_kg?: number;
  price_per_kg?: number;
  quality_score?: number;
  competitor_notes?: string;
  driver_notes?: string;
  visit_time?: string;
  completed_at?: string;
  restaurant?: {
    name: string;
    township: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  };
}

export const useUcoCollectionPlans = () => {
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['uco-collection-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uco_collection_plans')
        .select(`
          *,
          creator:users!created_by(full_name)
        `)
        .order('plan_date', { ascending: false });

      if (error) throw error;
      
      // Transform townships from string to array for backward compatibility
      return data.map(plan => ({
        ...plan,
        townships: Array.isArray(plan.townships) ? plan.townships : [plan.township].filter(Boolean)
      }));
    },
  });

  const createPlan = useMutation({
    mutationFn: async (planData: Omit<UcoCollectionPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('uco_collection_plans')
        .insert({
          ...planData,
          // Store townships as JSON array and maintain backward compatibility
          townships: planData.townships,
          township: planData.townships[0] || null // Keep first township for backward compatibility
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        townships: Array.isArray(data.townships) ? data.townships : [data.township].filter(Boolean)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success('UCO collection plan created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create UCO collection plan');
      console.error('Error creating plan:', error);
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UcoCollectionPlan> & { id: string }) => {
      const updateData = { ...updates };
      // Maintain backward compatibility
      if (updates.townships) {
        updateData.township = updates.townships[0] || null;
      }
      
      const { data, error } = await supabase
        .from('uco_collection_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        townships: Array.isArray(data.townships) ? data.townships : [data.township].filter(Boolean)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success('Plan updated successfully');
    },
  });

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
  };
};

export const useUcoCollectionItems = (planId?: string) => {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['uco-collection-items', planId],
    queryFn: async () => {
      if (!planId) return [];
      
      const { data, error } = await supabase
        .from('uco_collection_items')
        .select(`
          *,
          restaurant:restaurants(
            name,
            township,
            address,
            contact_person,
            phone
          )
        `)
        .eq('plan_id', planId)
        .order('route_sequence');

      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const createItem = useMutation({
    mutationFn: async (itemData: Omit<UcoCollectionItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('uco_collection_items')
        .insert(itemData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UcoCollectionItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('uco_collection_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
    },
  });

  const bulkCreateItems = useMutation({
    mutationFn: async (items: Omit<UcoCollectionItem, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('uco_collection_items')
        .insert(items)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
      toast.success('Restaurants added to collection plan');
    },
  });

  return {
    items,
    isLoading,
    createItem,
    updateItem,
    bulkCreateItems,
  };
};
