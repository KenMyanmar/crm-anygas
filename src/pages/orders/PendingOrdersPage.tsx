
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';
import { canApproveOrders, getUserRole } from '@/utils/roleUtils';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  Clock
} from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';

interface PendingOrder {
  id: string;
  order_number: string;
  order_date: string;
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

const PendingOrdersPage = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
    checkApprovalPermissions();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, townshipFilter]);

  const checkApprovalPermissions = async () => {
    const userRole = await getUserRole();
    setCanApprove(canApproveOrders(userRole));
  };

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
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
        .eq('status', 'PENDING_CONFIRMATION')
        .order('order_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        order_date: order.order_date,
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
      console.error('Error fetching pending orders:', error);
      toast({
        title: "Error fetching pending orders",
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Remove the order from the list since it's no longer pending
      setOrders(orders.filter(order => order.id !== orderId));
      
      const action = newStatus === 'CONFIRMED' ? 'approved' : 'rejected';
      toast({
        title: `Order ${action}`,
        description: `Order ${selectedOrder?.order_number} has been ${action} successfully.`
      });

    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setSelectedOrder(null);
    }
  };

  const handleApprove = (order: PendingOrder) => {
    setSelectedOrder(order);
    setShowApproveDialog(true);
  };

  const handleReject = (order: PendingOrder) => {
    setSelectedOrder(order);
    setShowRejectDialog(true);
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending orders...</p>
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Orders Awaiting Approval</h1>
              <p className="text-muted-foreground">
                Review and approve orders to process them for delivery
              </p>
            </div>
            {filteredOrders.length > 0 && (
              <Badge variant="outline" className="ml-4 bg-amber-50 text-amber-700 border-amber-200">
                {filteredOrders.length} orders pending
              </Badge>
            )}
          </div>
          <Button onClick={fetchPendingOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {!canApprove && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800 font-medium">
                  You need manager or admin permissions to approve/reject orders. 
                  You can view pending orders but cannot take action on them.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pending Orders Review
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
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500 mb-4">
                  {orders.length === 0 
                    ? "No orders are waiting for approval" 
                    : "All orders matching your filters have been processed"}
                </p>
                <Button variant="outline" onClick={fetchPendingOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for new orders
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="font-semibold">Order Details</TableHead>
                      <TableHead className="font-semibold">Restaurant</TableHead>
                      <TableHead className="font-semibold">Township</TableHead>
                      <TableHead className="font-semibold">Order Date</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Created By</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-amber-50/50">
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
                          <span className="font-semibold text-green-600">
                            {order.total_amount_kyats.toLocaleString()} Kyats
                          </span>
                        </TableCell>
                        <TableCell>{order.created_by_user?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            {canApprove && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(order)}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleReject(order)}
                                  disabled={isUpdating}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve order {selectedOrder?.order_number}? 
              This will move the order to confirmed status and allow it to proceed to delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
              className="bg-green-500 hover:bg-green-600"
            >
              Yes, approve order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject order {selectedOrder?.order_number}? 
              This will cancel the order and it cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'CANCELLED')}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, reject order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PendingOrdersPage;
