
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
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

interface PendingOrdersTableProps {
  orders: PendingOrder[];
  canApprove: boolean;
  isAdmin: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onApprove: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onDelete: (order: PendingOrder) => void;
}

const PendingOrdersTable = ({
  orders,
  canApprove,
  isAdmin,
  isUpdating,
  isDeleting,
  onApprove,
  onReject,
  onDelete
}: PendingOrdersTableProps) => {
  return (
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
          {orders.map((order) => (
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
                        onClick={() => onApprove(order)}
                        disabled={isUpdating || isDeleting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onReject(order)}
                        disabled={isUpdating || isDeleting}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(order)}
                      disabled={isUpdating || isDeleting}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingOrdersTable;
