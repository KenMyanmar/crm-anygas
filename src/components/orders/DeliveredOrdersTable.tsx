
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Eye, Package, CheckCircle, Trash2, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';
import { canDeleteDeliveredOrders, getUserRole } from '@/utils/roleUtils';
import { useOrderDeletion } from '@/hooks/useOrderDeletion';
import OrderStatusBadge from './OrderStatusBadge';
import PrintManager from './print/PrintManager';

interface DeliveredOrdersTableProps {
  orders: DeliveredOrder[];
  isLoading: boolean;
  onOrdersDeleted?: () => void;
}

const DeliveredOrdersTable = ({ orders, isLoading, onOrdersDeleted }: DeliveredOrdersTableProps) => {
  const [canDelete, setCanDelete] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<DeliveredOrder | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { deleteOrder, bulkDeleteOrders, isDeleting } = useOrderDeletion();

  useEffect(() => {
    checkDeletePermissions();
  }, []);

  const checkDeletePermissions = async () => {
    console.log('🔍 Starting permission check for delete buttons...');
    
    try {
      const userRole = await getUserRole();
      console.log('👤 Current user role:', userRole);
      
      const deletePermission = canDeleteDeliveredOrders(userRole);
      console.log('🔐 canDeleteDeliveredOrders result:', deletePermission);
      console.log('📋 Permission check details:', {
        userRole,
        deletePermission,
        expectedForAdmin: userRole === 'admin'
      });
      
      setCanDelete(deletePermission);
      console.log('✅ Setting canDelete state to:', deletePermission);
      
    } catch (error) {
      console.error('❌ Error in checkDeletePermissions:', error);
      setCanDelete(false);
    }
  };

  // Debug logging for canDelete state changes
  useEffect(() => {
    console.log('🔄 canDelete state changed to:', canDelete);
    console.log('🎛️ Current component state:', {
      canDelete,
      ordersCount: orders.length,
      selectedOrdersCount: selectedOrders.length
    });
  }, [canDelete, orders.length, selectedOrders.length]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  const calculateDeliveryPerformance = (scheduled: string, actual: string) => {
    const scheduledDate = new Date(scheduled);
    const actualDate = new Date(actual);
    const diffTime = actualDate.getTime() - scheduledDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { status: 'on-time', label: 'On Time', variant: 'default' as const, className: 'bg-green-100 text-green-800' };
    } else if (diffDays <= 2) {
      return { status: 'delayed', label: `${diffDays}d Late`, variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'severely-delayed', label: `${diffDays}d Late`, variant: 'destructive' as const, className: 'bg-red-100 text-red-800' };
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSingleDelete = async (order: DeliveredOrder) => {
    const success = await deleteOrder(order.id, order.order_number);
    if (success) {
      setOrderToDelete(null);
      onOrdersDeleted?.();
    }
  };

  const handleBulkDelete = async () => {
    const success = await bulkDeleteOrders(selectedOrders);
    if (success) {
      setSelectedOrders([]);
      setShowBulkDeleteDialog(false);
      onOrdersDeleted?.();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No delivered orders found</h3>
        <p className="text-gray-500">No orders match your current filters.</p>
      </div>
    );
  }

  // Debug logging for render
  console.log('🎨 Rendering DeliveredOrdersTable with:', {
    canDelete,
    ordersCount: orders.length,
    selectedOrdersCount: selectedOrders.length,
    showingBulkActions: canDelete && selectedOrders.length > 0
  });

  return (
    <div className="space-y-4">
      {canDelete && selectedOrders.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-700">
            {selectedOrders.length} order(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
            disabled={isDeleting}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              {canDelete && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold">Order Details</TableHead>
              <TableHead className="font-semibold">Restaurant</TableHead>
              <TableHead className="font-semibold">Township</TableHead>
              <TableHead className="font-semibold">Order Date</TableHead>
              <TableHead className="font-semibold">Delivery Performance</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const performance = calculateDeliveryPerformance(
                order.delivery_date_scheduled,
                order.delivery_date_actual
              );
              
              // Debug logging for each row render
              console.log(`🔍 Rendering row for order ${order.order_number}:`, {
                canDelete,
                showCheckbox: canDelete,
                showDeleteButton: canDelete
              });
              
              return (
                <TableRow key={order.id} className="hover:bg-green-50/50">
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-blue-600">{order.order_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.restaurant.name}</div>
                      <div className="text-sm text-gray-500">{order.restaurant.contact_person}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.restaurant.township || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(order.order_date)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={performance.className}>{performance.label}</Badge>
                      <div className="text-xs text-gray-500">
                        <div>Scheduled: {formatDate(order.delivery_date_scheduled)}</div>
                        <div>Delivered: {formatDate(order.delivery_date_actual)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">{formatCurrency(order.total_amount_kyats)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      <PrintManager order={order} variant="icon" size="sm" />
                      
                      {canDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setOrderToDelete(order)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Single Order Delete Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivered Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete order {orderToDelete?.order_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && handleSingleDelete(orderToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedOrders.length} selected order(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedOrders.length} Orders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeliveredOrdersTable;
