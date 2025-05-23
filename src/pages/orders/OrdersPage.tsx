
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/types';
import { formatDate } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, Package, Truck, Check, X, AlertCircle, RefreshCcw } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Order status updated",
        description: `Order has been marked as ${newStatus.replace('_', ' ').toLowerCase()}`,
      });

      // Refresh the orders list
      fetchOrders();

    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
              onUpdateStatus={handleUpdateStatus}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>

          <TabsContent value="pending" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'PENDING_CONFIRMATION' || o.status === 'CONFIRMED')} 
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="delivery" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'OUT_FOR_DELIVERY')} 
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="delivered" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'DELIVERED')} 
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
              onViewOrder={(id) => navigate(`/orders/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="pt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === 'CANCELLED')} 
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
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
  onUpdateStatus: (id: string, status: string) => void;
  onViewOrder: (id: string) => void;
}

const OrdersTable = ({ orders, isLoading, onUpdateStatus, onViewOrder }: OrdersTableProps) => {
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

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING_CONFIRMATION':
        return [
          { value: 'CONFIRMED', label: 'Confirm Order' },
          { value: 'CANCELLED', label: 'Cancel Order' }
        ];
      case 'CONFIRMED':
        return [
          { value: 'OUT_FOR_DELIVERY', label: 'Mark as Out for Delivery' },
          { value: 'CANCELLED', label: 'Cancel Order' }
        ];
      case 'OUT_FOR_DELIVERY':
        return [
          { value: 'DELIVERED', label: 'Mark as Delivered' },
          { value: 'CONFIRMED', label: 'Return to Confirmed' }
        ];
      case 'DELIVERED':
        // No status changes available after delivery
        return [];
      case 'CANCELLED':
        return [
          { value: 'PENDING_CONFIRMATION', label: 'Reactivate Order' }
        ];
      default:
        return [];
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
            <TableRow 
              key={order.id}
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
              <TableCell>{order.total_amount_kyats.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-right">
                <div onClick={(e) => e.stopPropagation()}>
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
                      {getNextStatusOptions(order.status).map((option) => (
                        <DropdownMenuItem 
                          key={option.value}
                          onClick={() => onUpdateStatus(order.id, option.value)}
                        >
                          {option.value === 'DELIVERED' ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : option.value === 'CANCELLED' ? (
                            <X className="mr-2 h-4 w-4" />
                          ) : option.value === 'OUT_FOR_DELIVERY' ? (
                            <Truck className="mr-2 h-4 w-4" />
                          ) : (
                            <Package className="mr-2 h-4 w-4" />
                          )}
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersPage;
