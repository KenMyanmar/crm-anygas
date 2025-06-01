
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';
import { canManageOrders, getUserRole } from '@/utils/roleUtils';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Truck, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Package
} from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderActionButtons from '@/components/orders/OrderActionButtons';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';

interface ApprovedOrder {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date_scheduled: string | null;
  total_amount_kyats: number;
  status: string;
  restaurant: {
    id: string;
    name: string;
    township: string;
  };
  created_by_user: {
    full_name: string;
  } | null;
}

const ApprovedOrdersPage = () => {
  const [orders, setOrders] = useState<ApprovedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ApprovedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('all');

  useEffect(() => {
    fetchApprovedOrders();
    checkManagePermissions();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, townshipFilter]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('approved-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated in approved page:', payload);
          fetchApprovedOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkManagePermissions = async () => {
    const userRole = await getUserRole();
    setCanManage(canManageOrders(userRole));
  };

  const fetchApprovedOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
          delivery_date_scheduled,
          total_amount_kyats,
          status,
          restaurants!inner (
            id,
            name,
            township
          ),
          users!orders_created_by_user_id_fkey (
            full_name
          )
        `)
        .eq('status', 'CONFIRMED')
        .order('order_date', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedData = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        order_date: order.order_date,
        delivery_date_scheduled: order.delivery_date_scheduled,
        total_amount_kyats: order.total_amount_kyats,
        status: order.status,
        restaurant: {
          id: order.restaurants?.id || '',
          name: order.restaurants?.name || 'Unknown Restaurant',
          township: order.restaurants?.township || 'N/A'
        },
        created_by_user: order.users ? {
          full_name: order.users.full_name
        } : null
      }));

      setOrders(transformedData);
    } catch (error: any) {
      console.error('Error fetching approved orders:', error);
      toast({
        title: "Error fetching approved orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (townshipFilter !== 'all') {
      filtered = filtered.filter(order =>
        order.restaurant.township === townshipFilter
      );
    }

    setFilteredOrders(filtered);
  };

  const getTownships = () => {
    const townships = [...new Set(orders.map(order => order.restaurant.township).filter(Boolean))];
    return townships.sort();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading approved orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Approved Orders</h1>
              <p className="text-muted-foreground">
                Manage approved orders and prepare them for delivery
              </p>
            </div>
            {filteredOrders.length > 0 && (
              <Badge variant="outline" className="ml-4 bg-blue-50 text-blue-700 border-blue-200">
                {filteredOrders.length} approved orders
              </Badge>
            )}
          </div>
          <Button onClick={fetchApprovedOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Ready for Delivery
              </CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={townshipFilter} onValueChange={setTownshipFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by township" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Townships</SelectItem>
                    {getTownships().map((township) => (
                      <SelectItem key={township} value={township}>
                        {township}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No approved orders</h3>
                <p className="text-gray-500 mb-4">
                  {orders.length === 0 
                    ? "No orders have been approved yet" 
                    : "All approved orders matching your filters are being processed"}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={fetchApprovedOrders}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button asChild>
                    <Link to="/orders/pending">
                      View Pending Orders
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="font-semibold">Order Details</TableHead>
                      <TableHead className="font-semibold">Restaurant</TableHead>
                      <TableHead className="font-semibold">Township</TableHead>
                      <TableHead className="font-semibold">Order Date</TableHead>
                      <TableHead className="font-semibold">Scheduled Delivery</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <ApprovedOrderRow
                        key={order.id}
                        order={order}
                        canManage={canManage}
                        onOrderUpdated={fetchApprovedOrders}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const ApprovedOrderRow = ({ order, canManage, onOrderUpdated }: {
  order: ApprovedOrder;
  canManage: boolean;
  onOrderUpdated: () => void;
}) => {
  const { updateOrderStatus } = useOrderStatusHistory(order.id);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const success = await updateOrderStatus(newStatus, `Status changed to ${newStatus.replace('_', ' ')}`);
    if (success) {
      onOrderUpdated();
    }
    setIsUpdating(false);
  };

  return (
    <TableRow className="hover:bg-blue-50/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="sm" />
          <span className="font-medium text-blue-600">{order.order_number}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{order.restaurant.name}</TableCell>
      <TableCell>{order.restaurant.township || 'N/A'}</TableCell>
      <TableCell>{formatDate(order.order_date)}</TableCell>
      <TableCell>
        {order.delivery_date_scheduled ? formatDate(order.delivery_date_scheduled) : 'Not scheduled'}
      </TableCell>
      <TableCell>
        <span className="font-semibold text-green-600">
          {order.total_amount_kyats.toLocaleString()} Kyats
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/orders/${order.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          {canManage && (
            <Button 
              size="sm" 
              onClick={() => handleStatusChange('OUT_FOR_DELIVERY')}
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Truck className="h-4 w-4 mr-1" />
              Start Delivery
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ApprovedOrdersPage;
