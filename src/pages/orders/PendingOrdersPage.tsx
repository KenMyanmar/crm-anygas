
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { canApproveOrders, getUserRole, hasAdminAccess } from '@/utils/roleUtils';
import { useOrderDeletion } from '@/hooks/useOrderDeletion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import PendingOrdersHeader from '@/components/orders/pending/PendingOrdersHeader';
import PendingOrdersFilters from '@/components/orders/pending/PendingOrdersFilters';
import PendingOrdersTable from '@/components/orders/pending/PendingOrdersTable';
import PendingOrdersEmptyState from '@/components/orders/pending/PendingOrdersEmptyState';
import PendingOrdersDialogs from '@/components/orders/pending/PendingOrdersDialogs';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteOrder, isDeleting } = useOrderDeletion();

  useEffect(() => {
    fetchPendingOrders();
    checkPermissions();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, townshipFilter]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('pending-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated in pending page:', payload);
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkPermissions = async () => {
    const userRole = await getUserRole();
    console.log('User role in pending orders:', userRole);
    setCanApprove(canApproveOrders(userRole));
    setIsAdmin(hasAdminAccess(userRole));
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

  const handleDelete = (order: PendingOrder) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrder) return;
    
    const success = await deleteOrder(selectedOrder.id, selectedOrder.order_number);
    if (success) {
      setOrders(orders.filter(order => order.id !== selectedOrder.id));
    }
    setShowDeleteDialog(false);
    setSelectedOrder(null);
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
        <PendingOrdersHeader 
          ordersCount={filteredOrders.length}
          onRefresh={fetchPendingOrders}
        />

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
              <PendingOrdersFilters
                searchTerm={searchTerm}
                townshipFilter={townshipFilter}
                townships={getTownships()}
                onSearchChange={setSearchTerm}
                onTownshipChange={setTownshipFilter}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <PendingOrdersEmptyState 
                totalOrders={orders.length}
                onRefresh={fetchPendingOrders}
              />
            ) : (
              <PendingOrdersTable
                orders={filteredOrders}
                canApprove={canApprove}
                isAdmin={isAdmin}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <PendingOrdersDialogs
        selectedOrder={selectedOrder}
        showApproveDialog={showApproveDialog}
        showRejectDialog={showRejectDialog}
        showDeleteDialog={showDeleteDialog}
        onApproveDialogChange={setShowApproveDialog}
        onRejectDialogChange={setShowRejectDialog}
        onDeleteDialogChange={setShowDeleteDialog}
        onConfirmApprove={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
        onConfirmReject={() => selectedOrder && updateOrderStatus(selectedOrder.id, 'CANCELLED')}
        onConfirmDelete={confirmDelete}
      />
    </DashboardLayout>
  );
};

export default PendingOrdersPage;
