
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface PendingOrdersHeaderProps {
  ordersCount: number;
  onRefresh: () => void;
}

const PendingOrdersHeader = ({ ordersCount, onRefresh }: PendingOrdersHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Awaiting Approval</h1>
          <p className="text-muted-foreground">
            Review and approve orders to process them for delivery
          </p>
        </div>
        {ordersCount > 0 && (
          <Badge variant="outline" className="ml-4 bg-amber-50 text-amber-700 border-amber-200">
            {ordersCount} orders pending
          </Badge>
        )}
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default PendingOrdersHeader;
