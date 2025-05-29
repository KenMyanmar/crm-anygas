
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
  Package, 
  Check, 
  X, 
  Eye, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

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
        .eq('status', 'PENDING_APPROVAL')
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
      
      const action = newStatus === 'APPROVED' ? 'approved' : 'rejected';
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
          <p className="text-muted-foreground">Loading pending orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight">Pending Orders</h1>
            <Badge variant="outline" className="ml-2">
              {filteredOrders.length} orders
            </Badge>
          </div>
          <Button onClick={fetchPendingOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {!canApprove && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-amber-800">
                You need manager or admin permissions to approve/reject orders. 
                You can view pending orders but cannot take action on them.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number or restaurant name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No pending orders found</p>
                <p className="text-sm text-muted-foreground">
                  {orders.length === 0 
                    ? "All orders have been processed" 
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Township</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.restaurant.name}</TableCell>
                      <TableCell>{order.restaurant.township || 'N/A'}</TableCell>
                      <TableCell>{formatDate(order.order_date)}</TableCell>
                      <TableCell>{order.total_amount_kyats.toLocaleString()} Kyats</TableCell>
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
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleReject(order)}
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4 mr-1" />
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
              This will move the order to approved status and allow it to proceed to delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'APPROVED')}
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
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'CANCELED')}
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
