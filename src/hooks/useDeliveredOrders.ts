
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DeliveredOrder {
  id: string;
  order_number: string;
  restaurant: {
    id: string;
    name: string;
    township: string;
    contact_person: string;
    phone: string;
  };
  order_date: string;
  delivery_date_scheduled: string;
  delivery_date_actual: string;
  total_amount_kyats: number;
  notes: string;
  created_by_user: {
    full_name: string;
  };
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price_kyats: number;
    sub_total_kyats: number;
  }>;
}

export const useDeliveredOrders = () => {
  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const { toast } = useToast();

  const fetchDeliveredOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
          delivery_date_scheduled,
          delivery_date_actual,
          total_amount_kyats,
          notes,
          restaurant:restaurants (
            id,
            name,
            township,
            contact_person,
            phone
          ),
          created_by_user:users!orders_created_by_user_id_fkey (
            full_name
          ),
          order_items (
            product_name,
            quantity,
            unit_price_kyats,
            sub_total_kyats
          )
        `)
        .eq('status', 'DELIVERED')
        .order('delivery_date_actual', { ascending: false });

      if (error) {
        console.error('Error fetching delivered orders:', error);
        toast({
          title: "Error",
          description: "Failed to load delivered orders",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our interface
      const transformedData: DeliveredOrder[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        order_date: order.order_date,
        delivery_date_scheduled: order.delivery_date_scheduled,
        delivery_date_actual: order.delivery_date_actual,
        total_amount_kyats: order.total_amount_kyats,
        notes: order.notes,
        restaurant: Array.isArray(order.restaurant) ? order.restaurant[0] : order.restaurant,
        created_by_user: Array.isArray(order.created_by_user) ? order.created_by_user[0] : order.created_by_user,
        order_items: order.order_items || []
      }));

      setOrders(transformedData);
    } catch (error) {
      console.error('Error in fetchDeliveredOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load delivered orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Township filter
    if (townshipFilter) {
      filtered = filtered.filter(order =>
        order.restaurant.township?.toLowerCase().includes(townshipFilter.toLowerCase())
      );
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(order => 
        new Date(order.delivery_date_actual) >= new Date(dateFromFilter)
      );
    }

    if (dateToFilter) {
      filtered = filtered.filter(order => 
        new Date(order.delivery_date_actual) <= new Date(dateToFilter)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, townshipFilter, dateFromFilter, dateToFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setTownshipFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  return {
    orders: filteredOrders,
    isLoading,
    searchTerm,
    setSearchTerm,
    townshipFilter,
    setTownshipFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    clearFilters,
    refetch: fetchDeliveredOrders
  };
};
