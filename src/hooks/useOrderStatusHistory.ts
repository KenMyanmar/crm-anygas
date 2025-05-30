
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
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus.replace('_', ' ').toLowerCase()}`,
      });

      // Refresh status history
      await fetchStatusHistory();

      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
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
