
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const useSimpleOrderStatus = () => {
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);

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
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });

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

  return { updateOrderStatus };
};
