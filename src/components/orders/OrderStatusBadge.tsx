
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck, Package, XCircle, AlertCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

const OrderStatusBadge = ({ status, size = 'default' }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return {
          variant: 'default' as const,
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertCircle,
          label: 'Pending Approval'
        };
      case 'CONFIRMED':
        return {
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          label: 'Confirmed'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck,
          label: 'In Delivery'
        };
      case 'DELIVERED':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Package,
          label: 'Delivered'
        };
      case 'CANCELLED':
        return {
          variant: 'default' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          variant: 'default' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} flex items-center gap-1 font-medium`}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
