
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UcoCollectionPlan } from '@/types/ucoCollection';

export const useUcoPlans = () => {
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
      
      // Transform data to ensure townships is always an array
      return data.map(plan => ({
        ...plan,
        townships: Array.isArray(plan.townships) && plan.townships.length > 0 
          ? plan.townships 
          : [plan.township].filter(Boolean)
      }));
    },
  });

  const createPlan = useMutation({
    mutationFn: async (planData: Omit<UcoCollectionPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const insertData = {
        plan_name: planData.plan_name,
        plan_date: planData.plan_date,
        driver_name: planData.driver_name,
        truck_capacity_kg: planData.truck_capacity_kg,
        created_by: planData.created_by,
        townships: planData.townships,
        // Set township to first township for backward compatibility
        township: planData.townships[0] || null
      };

      const { data, error } = await supabase
        .from('uco_collection_plans')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        townships: Array.isArray(data.townships) && data.townships.length > 0 
          ? data.townships 
          : [data.township].filter(Boolean)
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
      
      // If townships is being updated, also update the township field for backward compatibility
      if (updates.townships) {
        updateData.townships = updates.townships;
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
        townships: Array.isArray(data.townships) && data.townships.length > 0 
          ? data.townships 
          : [data.township].filter(Boolean)
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
