
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Package, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';

interface RestaurantOrder {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date_scheduled?: string;
  delivery_date_actual?: string;
  status: string;
  total_amount_kyats: number;
  notes?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price_kyats: number;
    sub_total_kyats: number;
  }>;
  created_by_user?: {
    full_name: string;
  };
}

interface RestaurantOrdersProps {
  restaurantId: string;
}

const RestaurantOrders = ({ restaurantId }: RestaurantOrdersProps) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  const fetchOrders = async () => {
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
          status,
          total_amount_kyats,
          notes,
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
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const ordersData = (data || []).map((order: any) => ({
        ...order,
        created_by_user: Array.isArray(order.created_by_user) ? order.created_by_user[0] : order.created_by_user
      }));

      setOrders(ordersData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount_kyats || 0), 0);
      const pendingOrders = ordersData.filter(order => 
        ['PENDING_CONFIRMATION', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(order.status)
      ).length;
      const deliveredOrders = ordersData.filter(order => order.status === 'DELIVERED').length;

      setStats({
        totalOrders: ordersData.length,
        totalRevenue,
        pendingOrders,
        deliveredOrders
      });

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'secondary';
      case 'CONFIRMED':
        return 'default';
      case 'OUT_FOR_DELIVERY':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">This restaurant hasn't placed any orders yet.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium">{order.order_number}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(order.order_date)}</div>
                          {order.delivery_date_scheduled && (
                            <div className="text-muted-foreground">
                              Delivery: {formatDate(order.delivery_date_scheduled)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(order.total_amount_kyats)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.created_by_user?.full_name || 'Unknown'}</span>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantOrders;
