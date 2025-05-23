
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Order, OrderItem } from '@/types';
import { formatDate } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ChevronLeft, 
  Package, 
  Check, 
  X, 
  Truck, 
  Edit2, 
  Printer,
  Calendar 
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      // Fetch order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(id, name, township, address, phone)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw orderError;
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      setOrder(orderData);
      setOrderItems(itemsData || []);

    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error fetching order details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!id) return;
    
    setIsUpdating(true);
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

      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus as any
        });
      }

      toast({
        title: "Order status updated",
        description: `Order has been marked as ${newStatus.replace('_', ' ').toLowerCase()}`
      });

    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowCancelDialog(false);
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

  const getStatusButtons = () => {
    if (!order) return null;

    switch (order.status) {
      case 'PENDING_CONFIRMATION':
        return (
          <>
            <Button onClick={() => updateOrderStatus('CONFIRMED')} disabled={isUpdating}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Order
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(true)}
              disabled={isUpdating}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          </>
        );
      case 'CONFIRMED':
        return (
          <>
            <Button onClick={() => updateOrderStatus('OUT_FOR_DELIVERY')} disabled={isUpdating}>
              <Truck className="mr-2 h-4 w-4" />
              Mark as Out for Delivery
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(true)}
              disabled={isUpdating}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          </>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <Button onClick={() => updateOrderStatus('DELIVERED')} disabled={isUpdating}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        );
      case 'CANCELLED':
        return (
          <Button onClick={() => updateOrderStatus('PENDING_CONFIRMATION')} disabled={isUpdating}>
            <Package className="mr-2 h-4 w-4" />
            Reactivate Order
          </Button>
        );
      case 'DELIVERED':
        // No status change buttons for delivered orders
        return null;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Button>
            <h1 className="text-2xl font-bold tracking-tight ml-4">
              Order {order.order_number}
            </h1>
            <div className="ml-4">
              {getStatusBadge(order.status)}
            </div>
          </div>
          <div className="flex gap-2">
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <Button variant="outline" asChild>
                <Link to={`/orders/${id}/edit`}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Order
                </Link>
              </Button>
            )}
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Details about this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                  <p>{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p>{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{order.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p>{order.total_amount_kyats.toLocaleString()} Kyats</p>
                </div>
              </div>

              {order.delivery_date_scheduled && (
                <div className="pt-2">
                  <div className="flex items-center text-amber-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <p className="text-sm font-medium">
                      Scheduled Delivery: {formatDate(order.delivery_date_scheduled)}
                    </p>
                  </div>
                </div>
              )}

              {order.delivery_date_actual && (
                <div className="pt-2">
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <p className="text-sm font-medium">
                      Delivered On: {formatDate(order.delivery_date_actual)}
                    </p>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="pt-4">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{order.notes}</p>
                </div>
              )}
            </CardContent>
            {getStatusButtons() && (
              <CardFooter className="gap-4 justify-end">
                {getStatusButtons()}
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>Restaurant that placed this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.restaurant && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="font-medium">{order.restaurant.name}</p>
                  </div>
                  
                  {order.restaurant.township && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Township</p>
                      <p>{order.restaurant.township}</p>
                    </div>
                  )}
                  
                  {order.restaurant.address && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{order.restaurant.address}</p>
                    </div>
                  )}
                  
                  {order.restaurant.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{order.restaurant.phone}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to={`/restaurants/${order.restaurant_id}`}>
                  View Restaurant Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Items included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-right">{item.unit_price_kyats.toLocaleString()} Kyats</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.sub_total_kyats.toLocaleString()} Kyats</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4">
            <div className="text-lg font-semibold">
              Total: {order.total_amount_kyats.toLocaleString()} Kyats
            </div>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => updateOrderStatus('CANCELLED')}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default OrderDetailPage;
