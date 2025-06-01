
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const useOrderDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteOrder = async (orderId: string, orderNumber: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        throw itemsError;
      }

      // Delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        throw orderError;
      }

      toast({
        title: "Order Deleted",
        description: `Order ${orderNumber} has been permanently deleted.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: `Failed to delete order: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const bulkDeleteOrders = async (orderIds: string[]): Promise<boolean> => {
    setIsDeleting(true);
    try {
      // Delete order items first
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      if (itemsError) {
        throw itemsError;
      }

      // Delete the orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (ordersError) {
        throw ordersError;
      }

      toast({
        title: "Orders Deleted",
        description: `${orderIds.length} orders have been permanently deleted.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting orders:', error);
      toast({
        title: "Error",
        description: `Failed to delete orders: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteOrder,
    bulkDeleteOrders,
    isDeleting
  };
};
