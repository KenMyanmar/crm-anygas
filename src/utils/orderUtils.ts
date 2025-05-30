
import { supabase } from '@/lib/supabase';

export const generateOrderNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  
  try {
    // Get the highest order number for this year
    const { data: existingOrders, error } = await supabase
      .from('orders')
      .select('order_number')
      .like('order_number', `ORD-${currentYear}-%`)
      .order('order_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching existing orders:', error);
      // Fallback to timestamp-based number
      const timeStr = Date.now().toString().slice(-6);
      return `ORD-${currentYear}-${timeStr}`;
    }

    let sequenceNumber = 1;
    
    if (existingOrders && existingOrders.length > 0) {
      const lastOrderNumber = existingOrders[0].order_number;
      const match = lastOrderNumber.match(/ORD-\d{4}-(\d+)/);
      if (match) {
        sequenceNumber = parseInt(match[1]) + 1;
      }
    }

    return `ORD-${currentYear}-${sequenceNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback to timestamp-based number
    const timeStr = Date.now().toString().slice(-6);
    return `ORD-${currentYear}-${timeStr}`;
  }
};
