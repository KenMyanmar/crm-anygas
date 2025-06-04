
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface PendingOrdersEmptyStateProps {
  totalOrders: number;
  onRefresh: () => void;
}

const PendingOrdersEmptyState = ({ totalOrders, onRefresh }: PendingOrdersEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
      <p className="text-gray-500 mb-4">
        {totalOrders === 0 
          ? "No orders are waiting for approval" 
          : "All orders matching your filters have been processed"}
      </p>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Check for new orders
        </Button>
        <Button asChild>
          <Link to="/orders">
            View All Orders
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PendingOrdersEmptyState;
