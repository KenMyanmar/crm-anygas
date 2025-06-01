
import { useState } from 'react';
import { Order } from '@/types/orders';
import { formatDate } from '@/lib/supabase';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderActionButtons from '@/components/orders/OrderActionButtons';
import PrintManager from '@/components/orders/print/PrintManager';
import { Link } from 'react-router-dom';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onOrderUpdated: () => void;
  onViewOrder: (id: string) => void;
  currentTab: string;
}

const OrdersTable = ({ orders, isLoading, onOrderUpdated, onViewOrder, currentTab }: OrdersTableProps) => {
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
    const getEmptyMessage = () => {
      switch (currentTab) {
        case 'pending':
          return 'No orders are waiting for approval';
        case 'process':
          return 'No orders are currently in process';
        case 'delivered':
          return 'No orders have been delivered yet';
        default:
          return 'No orders found';
      }
    };

    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-500">{getEmptyMessage()}</p>
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
    console.log(`Updating order ${order.id} status from ${order.status} to ${newStatus}`);
    
    const success = await updateOrderStatus(newStatus, `Status changed to ${newStatus.replace('_', ' ')}`);
    if (success) {
      // The parent will refresh automatically via real-time subscription
      onOrderUpdated();
    }
    setIsUpdating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  // Convert order to the format needed for PrintManager
  const getOrderForPrinting = () => {
    return {
      id: order.id,
      order_number: order.order_number,
      order_date: order.order_date,
      delivery_date_scheduled: order.delivery_date_scheduled || order.order_date,
      delivery_date_actual: order.delivery_date_actual || new Date().toISOString(),
      total_amount_kyats: order.total_amount_kyats || 0,
      notes: order.notes || '',
      restaurant: {
        id: order.restaurant?.id || '',
        name: order.restaurant?.name || 'Unknown Restaurant',
        township: order.restaurant?.township || '',
        contact_person: order.restaurant?.contact_person || '',
        phone: order.restaurant?.phone || '',
      },
      created_by_user: {
        full_name: 'Current User',
      },
      order_items: order.order_items?.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price_kyats: item.unit_price_kyats,
        sub_total_kyats: item.sub_total_kyats,
      })) || []
    };
  };

  const orderForPrinting = getOrderForPrinting();

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <Link to={`/orders/${order.id}`} className="font-medium text-blue-600 hover:text-blue-800">
            {order.order_number}
          </Link>
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
        <div className="flex items-center gap-2 justify-end">
          <PrintManager order={orderForPrinting} variant="icon" size="sm" />
          <OrderActionButtons
            status={order.status}
            onStatusChange={handleStatusChange}
            onViewOrder={() => onViewOrder(order.id)}
            isUpdating={isUpdating}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrdersTable;
