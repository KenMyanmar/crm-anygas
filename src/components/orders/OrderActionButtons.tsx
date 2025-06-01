
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  AlertTriangle, 
  RotateCcw,
  Eye,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderActionButtonsProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  onViewOrder: () => void;
  isUpdating?: boolean;
  showViewButton?: boolean;
}

const OrderActionButtons = ({ 
  status, 
  onStatusChange, 
  onViewOrder, 
  isUpdating = false,
  showViewButton = true 
}: OrderActionButtonsProps) => {
  const getActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING_CONFIRMATION':
        return [
          {
            label: 'Approve',
            action: () => onStatusChange('CONFIRMED'),
            icon: CheckCircle,
            variant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700 text-white'
          },
          {
            label: 'Reject',
            action: () => onStatusChange('CANCELLED'),
            icon: XCircle,
            variant: 'destructive' as const,
            className: ''
          }
        ];
      case 'CONFIRMED':
        return [
          {
            label: 'Start Delivery',
            action: () => onStatusChange('OUT_FOR_DELIVERY'),
            icon: Truck,
            variant: 'default' as const,
            className: 'bg-purple-600 hover:bg-purple-700 text-white'
          },
          {
            label: 'Mark Delivered',
            action: () => onStatusChange('DELIVERED'),
            icon: Package,
            variant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700 text-white'
          },
          {
            label: 'Cancel',
            action: () => onStatusChange('CANCELLED'),
            icon: XCircle,
            variant: 'outline' as const,
            className: 'text-red-600 border-red-200 hover:bg-red-50'
          }
        ];
      case 'OUT_FOR_DELIVERY':
        return [
          {
            label: 'Mark Delivered',
            action: () => onStatusChange('DELIVERED'),
            icon: Package,
            variant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700 text-white'
          },
          {
            label: 'Return to Confirmed',
            action: () => onStatusChange('CONFIRMED'),
            icon: RotateCcw,
            variant: 'outline' as const,
            className: ''
          }
        ];
      case 'CANCELLED':
        return [
          {
            label: 'Reactivate',
            action: () => onStatusChange('PENDING_CONFIRMATION'),
            icon: AlertTriangle,
            variant: 'outline' as const,
            className: 'text-amber-600 border-amber-200 hover:bg-amber-50'
          }
        ];
      case 'DELIVERED':
        return [
          {
            label: 'Reopen',
            action: () => onStatusChange('CONFIRMED'),
            icon: Clock,
            variant: 'outline' as const,
            className: 'text-blue-600 border-blue-200 hover:bg-blue-50'
          }
        ];
      default:
        return [];
    }
  };

  const actions = getActions(status);

  return (
    <div className="flex items-center gap-2">
      {showViewButton && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewOrder}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      )}
      
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant}
            size="sm"
            onClick={action.action}
            disabled={isUpdating}
            className={`flex items-center gap-1 ${action.className}`}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default OrderActionButtons;
