
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UcoCollectionItem } from '@/types/ucoCollection';

export const useUcoItems = (planId?: string) => {
  const queryClient = useQueryClient();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['uco-collection-items', planId],
    queryFn: async () => {
      if (!planId) return [];
      
      console.log('Fetching UCO collection items for plan:', planId);
      
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
        .order('route_sequence', { ascending: true });

      if (error) {
        console.error('Error fetching UCO collection items:', error);
        throw error;
      }
      
      console.log('Fetched UCO collection items:', data);
      return data as UcoCollectionItem[];
    },
    enabled: !!planId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });

  const createItem = useMutation({
    mutationFn: async (itemData: Omit<UcoCollectionItem, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating UCO collection item:', itemData);
      
      const { data, error } = await supabase
        .from('uco_collection_items')
        .insert(itemData)
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
        .single();
      
      if (error) {
        console.error('Error creating UCO collection item:', error);
        throw error;
      }
      
      console.log('Created UCO collection item:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success('Collection item added successfully');
    },
    onError: (error) => {
      console.error('Failed to create collection item:', error);
      toast.error('Failed to add collection item');
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UcoCollectionItem> & { id: string }) => {
      console.log('Updating UCO collection item:', id, updates);
      
      const { data, error } = await supabase
        .from('uco_collection_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
        .single();
      
      if (error) {
        console.error('Error updating UCO collection item:', error);
        throw error;
      }
      
      console.log('Updated UCO collection item:', data);
      return data;
    },
    onSuccess: (data) => {
      // Update the cache immediately for better UX
      queryClient.setQueryData<UcoCollectionItem[]>(
        ['uco-collection-items', planId],
        (oldData) => {
          if (!oldData) return [data];
          return oldData.map(item => item.id === data.id ? data : item);
        }
      );
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items', planId] });
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
    },
    onError: (error) => {
      console.error('Failed to update collection item:', error);
      toast.error('Failed to update collection item');
    },
  });

  const bulkCreateItems = useMutation({
    mutationFn: async (items: Omit<UcoCollectionItem, 'id' | 'created_at' | 'updated_at'>[]) => {
      console.log('Bulk creating UCO collection items:', items);
      
      const { data, error } = await supabase
        .from('uco_collection_items')
        .insert(items)
        .select(`
          *,
          restaurant:restaurants(
            name,
            township,
            address,
            contact_person,
            phone
          )
        `);
      
      if (error) {
        console.error('Error bulk creating UCO collection items:', error);
        throw error;
      }
      
      console.log('Bulk created UCO collection items:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success(`Successfully added ${data.length} restaurants to collection plan`);
    },
    onError: (error) => {
      console.error('Failed to bulk create collection items:', error);
      toast.error('Failed to add restaurants to collection plan');
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      console.log('Deleting UCO collection item:', itemId);
      
      const { error } = await supabase
        .from('uco_collection_items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('Error deleting UCO collection item:', error);
        throw error;
      }
      
      console.log('Deleted UCO collection item:', itemId);
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-items'] });
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success('Restaurant removed from collection plan');
    },
    onError: (error) => {
      console.error('Failed to delete collection item:', error);
      toast.error('Failed to remove restaurant from plan');
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    bulkCreateItems,
    deleteItem,
  };
};
