
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/supabase';
import { Clock, User } from 'lucide-react';

interface OrderStatusHistoryProps {
  orderId: string;
}

const OrderStatusHistory = ({ orderId }: OrderStatusHistoryProps) => {
  const { statusHistory, isLoading } = useOrderStatusHistory(orderId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'bg-amber-500';
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500';
      case 'DELIVERED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading status history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        {statusHistory.length === 0 ? (
          <p className="text-muted-foreground">No status changes recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {entry.old_status && (
                      <>
                        <Badge className={getStatusBadgeVariant(entry.old_status)}>
                          {formatStatusText(entry.old_status)}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <Badge className={getStatusBadgeVariant(entry.new_status)}>
                      {formatStatusText(entry.new_status)}
                    </Badge>
                  </div>
                  
                  {entry.change_reason && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.change_reason}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(entry.changed_at)}
                    </div>
                    {entry.changed_by_user?.full_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.changed_by_user.full_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStatusHistory;
