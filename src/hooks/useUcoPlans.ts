
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
