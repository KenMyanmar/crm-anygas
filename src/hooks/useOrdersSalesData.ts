
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface OrdersData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  monthlyTrends: any[];
  ordersByStatus: any[];
  topTownships: any[];
  recentOrders: any[];
}

export const useOrdersSalesData = (timeRange: string) => {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with restaurant data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
          total_amount_kyats,
          status,
          restaurants (
            name,
            township
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;

      // Process data
      const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount_kyats) || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Orders by status
      const statusCounts = orders?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count,
        percentage: totalOrders > 0 ? ((count as number) / totalOrders * 100).toFixed(1) : 0
      }));

      // Top townships by revenue
      const townshipRevenue = orders?.reduce((acc: any, order) => {
        const township = (order.restaurants as any)?.township || 'Unknown';
        if (!acc[township]) {
          acc[township] = { revenue: 0, orders: 0 };
        }
        acc[township].revenue += Number(order.total_amount_kyats) || 0;
        acc[township].orders += 1;
        return acc;
      }, {}) || {};

      const topTownships = Object.entries(townshipRevenue)
        .map(([township, data]: [string, any]) => ({
          township,
          revenue: data.revenue,
          orders: data.orders,
          avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Monthly trends (mock data for now)
      const monthlyTrends = [
        { month: 'Jan', revenue: 180000, orders: 12 },
        { month: 'Feb', revenue: 220000, orders: 15 },
        { month: 'Mar', revenue: 280000, orders: 18 },
        { month: 'Apr', revenue: 320000, orders: 22 },
        { month: 'May', revenue: 380000, orders: 25 },
        { month: 'Jun', revenue: totalRevenue, orders: totalOrders }
      ];

      setData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        monthlyTrends,
        ordersByStatus,
        topTownships,
        recentOrders: orders?.slice(0, 5) || []
      });

    } catch (error: any) {
      console.error('Error fetching orders data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [timeRange]);

  return { data, loading };
};
