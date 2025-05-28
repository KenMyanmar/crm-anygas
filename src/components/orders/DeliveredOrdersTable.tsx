
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';

interface DeliveredOrdersTableProps {
  orders: DeliveredOrder[];
  isLoading: boolean;
}

const DeliveredOrdersTable = ({ orders, isLoading }: DeliveredOrdersTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  const calculateDeliveryPerformance = (scheduled: string, actual: string) => {
    const scheduledDate = new Date(scheduled);
    const actualDate = new Date(actual);
    const diffTime = actualDate.getTime() - scheduledDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { status: 'on-time', label: 'On Time', variant: 'default' as const };
    } else if (diffDays <= 2) {
      return { status: 'delayed', label: `${diffDays}d Late`, variant: 'secondary' as const };
    } else {
      return { status: 'severely-delayed', label: `${diffDays}d Late`, variant: 'destructive' as const };
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
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No delivered orders found</h3>
        <p className="text-gray-500">No orders match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Township</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Delivery Performance</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const performance = calculateDeliveryPerformance(
              order.delivery_date_scheduled,
              order.delivery_date_actual
            );
            
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{order.order_number}</span>
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
                  <div>
                    <div className="text-sm">{formatDate(order.order_date)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={performance.variant}>{performance.label}</Badge>
                    <div className="text-xs text-gray-500">
                      <div>Scheduled: {formatDate(order.delivery_date_scheduled)}</div>
                      <div>Delivered: {formatDate(order.delivery_date_actual)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{formatCurrency(order.total_amount_kyats)}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeliveredOrdersTable;
