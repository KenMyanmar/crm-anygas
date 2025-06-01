
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { OrderStatusHistory } from '@/types/orders';

export const useOrderStatusHistory = (orderId: string) => {
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          *,
          changed_by_user:users!order_status_history_changed_by_user_id_fkey(full_name)
        `)
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw error;
      }

      setStatusHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
      toast({
        title: "Error",
        description: "Failed to load status history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string, reason?: string) => {
    try {
      // Validate the status value to ensure it matches the enum
      const validStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      console.log(`Updating order ${orderId} to status: ${newStatus}`);

      // Get the current order to check current status
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log(`Current status: ${currentOrder.status}, New status: ${newStatus}`);

      // Update the order status - the trigger will automatically create the history entry
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      console.log(`Successfully updated order ${orderId} to ${newStatus}`);

      // Format status text for display
      const statusText = newStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      
      toast({
        title: "Success",
        description: `Order status updated to ${statusText}`,
      });

      // Refresh status history
      await fetchStatusHistory();

      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchStatusHistory();
    }
  }, [orderId]);

  return {
    statusHistory,
    isLoading,
    updateOrderStatus,
    refetch: fetchStatusHistory,
  };
};
