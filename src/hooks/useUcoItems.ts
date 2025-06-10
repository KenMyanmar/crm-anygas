
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UcoCollectionItem } from '@/types/ucoCollection';

export const useUcoItems = (planId?: string) => {
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
