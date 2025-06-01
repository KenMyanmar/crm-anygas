
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';
import OrderStatusBadge from './OrderStatusBadge';

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
      return { status: 'on-time', label: 'On Time', variant: 'default' as const, className: 'bg-green-100 text-green-800' };
    } else if (diffDays <= 2) {
      return { status: 'delayed', label: `${diffDays}d Late`, variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'severely-delayed', label: `${diffDays}d Late`, variant: 'destructive' as const, className: 'bg-red-100 text-red-800' };
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-green-50">
          <TableRow>
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
            
            return (
              <TableRow key={order.id} className="hover:bg-green-50/50">
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
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
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
