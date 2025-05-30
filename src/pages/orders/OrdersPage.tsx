
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
import { PlusCircle, FileText, Package, Truck, Check, X, AlertCircle, RefreshCcw, History } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

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

      if (activeTab !== 'all') {
        let statusFilter;
        switch (activeTab) {
          case 'pending':
            statusFilter = ['PENDING_CONFIRMATION', 'CONFIRMED'];
            break;
          case 'delivery':
            statusFilter = ['OUT_FOR_DELIVERY'];
            break;
          case 'delivered':
            statusFilter = ['DELIVERED'];
            break;
          case 'cancelled':
            statusFilter = ['CANCELLED'];
            break;
        }
        query = query.in('status', statusFilter);
      }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <Button asChild>
            <Link to="/orders/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Order
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="delivery">In Delivery</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <TabsContent value="all" className="pt-4">
            <OrdersTable 
              orders={orders} 
              isLoading={isLoading} 
              onOrderUpdated={fetchOrders}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>

          <TabsContent value="pending" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'PENDING_CONFIRMATION' || o.status === 'CONFIRMED')} 
              isLoading={isLoading}
              onOrderUpdated={fetchOrders}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="delivery" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'OUT_FOR_DELIVERY')} 
              isLoading={isLoading}
              onOrderUpdated={fetchOrders}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="delivered" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'DELIVERED')} 
              isLoading={isLoading}
              onOrderUpdated={fetchOrders}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'CANCELLED')} 
              isLoading={isLoading}
              onOrderUpdated={fetchOrders}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
        </Tabs>
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-amber-500">Pending Confirmation</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-500">Out for Delivery</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order #</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Total (Kyats)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-amber-500">Pending Confirmation</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-500">Out for Delivery</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING_CONFIRMATION':
        return [
          { value: 'CONFIRMED', label: 'Confirm Order', icon: Check },
          { value: 'CANCELLED', label: 'Cancel Order', icon: X }
        ];
      case 'CONFIRMED':
        return [
          { value: 'OUT_FOR_DELIVERY', label: 'Mark as Out for Delivery', icon: Truck },
          { value: 'CANCELLED', label: 'Cancel Order', icon: X }
        ];
      case 'OUT_FOR_DELIVERY':
        return [
          { value: 'DELIVERED', label: 'Mark as Delivered', icon: Check },
          { value: 'CONFIRMED', label: 'Return to Confirmed', icon: Package }
        ];
      case 'DELIVERED':
        return [];
      case 'CANCELLED':
        return [
          { value: 'PENDING_CONFIRMATION', label: 'Reactivate Order', icon: AlertCircle }
        ];
      default:
        return [];
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const success = await updateOrderStatus(newStatus, `Status changed to ${newStatus.replace('_', ' ')}`);
    if (success) {
      onOrderUpdated();
    }
  };

  return (
    <TableRow 
      onClick={() => onViewOrder(order.id)}
      className="cursor-pointer hover:bg-muted/50"
    >
      <TableCell className="font-medium">{order.order_number}</TableCell>
      <TableCell>
        {order.restaurant?.name}
        {order.restaurant?.township && (
          <span className="text-xs text-muted-foreground block">
            {order.restaurant.township}
          </span>
        )}
      </TableCell>
      <TableCell>{formatDate(order.order_date)}</TableCell>
      <TableCell>{order.total_amount_kyats?.toLocaleString() || 0}</TableCell>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell className="text-right">
        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Order Status History</DialogTitle>
              </DialogHeader>
              <OrderStatusHistoryDialog orderId={order.id} />
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {getNextStatusOptions(order.status).map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

const OrderStatusHistoryDialog = ({ orderId }: { orderId: string }) => {
  const { statusHistory, isLoading } = useOrderStatusHistory(orderId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading status history...</p>;
  }

  if (statusHistory.length === 0) {
    return <p className="text-muted-foreground">No status changes recorded yet.</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {statusHistory.map((entry) => (
        <div key={entry.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {entry.old_status && (
                  <Badge variant="outline" className="text-xs">
                    {entry.old_status.replace('_', ' ')}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">→</span>
                <Badge className="text-xs">
                  {entry.new_status.replace('_', ' ')}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(entry.changed_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Changed by {entry.changed_by_user?.full_name || 'Unknown User'}
            </p>
            {entry.change_reason && (
              <p className="text-sm mt-1">{entry.change_reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
