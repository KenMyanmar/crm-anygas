
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/types/orders';
import { formatDate } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, RefreshCcw, Search, Filter, Bell } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';
import OrderDashboardStats from '@/components/orders/OrderDashboardStats';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderActionButtons from '@/components/orders/OrderActionButtons';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('all');
  
  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
  }, [activeTab]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          fetchOrders();
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Order Updated",
              description: `Order ${payload.new.order_number} status changed to ${payload.new.status.replace('_', ' ')}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(id, name, township)
        `)
        .order('created_at', { ascending: false });

      let statusFilter;
      switch (activeTab) {
        case 'pending':
          statusFilter = ['PENDING_CONFIRMATION'];
          break;
        case 'process':
          statusFilter = ['CONFIRMED', 'OUT_FOR_DELIVERY'];
          break;
        case 'delivered':
          statusFilter = ['DELIVERED'];
          break;
      }
      query = query.in('status', statusFilter);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTownship = townshipFilter === 'all' || order.restaurant?.township === townshipFilter;
    return matchesSearch && matchesTownship;
  });

  const getOrderStats = () => {
    return {
      pendingCount: orders.filter(o => o.status === 'PENDING_CONFIRMATION').length,
      confirmedCount: orders.filter(o => ['CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
      deliveredCount: orders.filter(o => o.status === 'DELIVERED').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount_kyats || 0), 0)
    };
  };

  const getTownships = () => {
    const townships = [...new Set(orders.map(o => o.restaurant?.township).filter(Boolean))];
    return townships.sort();
  };

  const stats = getOrderStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage orders through their workflow: Pending → In Process → Delivered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {stats.pendingCount > 0 && (
              <Button variant="outline" asChild className="relative">
                <Link to="/orders/pending">
                  <Bell className="h-4 w-4 mr-2" />
                  Pending Approvals
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingCount}
                  </span>
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/orders/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Order
              </Link>
            </Button>
          </div>
        </div>

        <OrderDashboardStats stats={stats} />

        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Order Workflow Management</CardTitle>
              <div className="flex items-center gap-3">
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
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="data-[state=active]:bg-amber-100">
                  Pending Orders ({stats.pendingCount})
                </TabsTrigger>
                <TabsTrigger value="process" className="data-[state=active]:bg-blue-100">
                  In Process ({stats.confirmedCount})
                </TabsTrigger>
                <TabsTrigger value="delivered" className="data-[state=active]:bg-green-100">
                  Delivered ({stats.deliveredCount})
                </TabsTrigger>
              </TabsList>

              {['pending', 'process', 'delivered'].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <OrdersTable 
                    orders={filteredOrders} 
                    isLoading={isLoading} 
                    onOrderUpdated={fetchOrders}
                    onViewOrder={(id) => navigate(`/orders/${id}`)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onOrderUpdated: () => void;
  onViewOrder: (id: string) => void;
}

const OrdersTable = ({ orders, isLoading, onOrderUpdated, onViewOrder }: OrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-500">No orders match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Order Details</TableHead>
            <TableHead className="font-semibold">Restaurant</TableHead>
            <TableHead className="font-semibold">Order Date</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrderRow 
              key={order.id} 
              order={order} 
              onOrderUpdated={onOrderUpdated}
              onViewOrder={onViewOrder}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const OrderRow = ({ order, onOrderUpdated, onViewOrder }: { 
  order: Order; 
  onOrderUpdated: () => void;
  onViewOrder: (id: string) => void;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-blue-600">{order.order_number}</div>
          {order.delivery_date_scheduled && (
            <div className="text-sm text-gray-500">
              Due: {formatDate(order.delivery_date_scheduled)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{order.restaurant?.name || 'Unknown'}</div>
          {order.restaurant?.township && (
            <div className="text-sm text-gray-500">{order.restaurant.township}</div>
          )}
        </div>
      </TableCell>
      <TableCell>{formatDate(order.order_date)}</TableCell>
      <TableCell>
        <span className="font-semibold text-green-600">
          {formatCurrency(order.total_amount_kyats || 0)}
        </span>
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="text-right">
        <OrderActionButtons
          status={order.status}
          onStatusChange={handleStatusChange}
          onViewOrder={() => onViewOrder(order.id)}
          isUpdating={isUpdating}
        />
      </TableCell>
    </TableRow>
  );
};

export default OrdersPage;
