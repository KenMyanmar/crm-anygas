
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, DoorClosed, HelpCircle } from 'lucide-react';

interface UcoStatusBadgeProps {
  status: 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed' | 'not_assessed';
  size?: 'sm' | 'default';
}

export const UcoStatusBadge: React.FC<UcoStatusBadgeProps> = ({ status, size = 'default' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'have_uco':
        return {
          label: 'Have UCO',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-3 w-3" />
        };
      case 'no_uco_reuse_staff':
        return {
          label: 'NO UCO (Reuse/Staff)',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <XCircle className="h-3 w-3" />
        };
      case 'no_uco_not_ready':
        return {
          label: 'No UCO (Not Ready)',
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-3 w-3" />
        };
      case 'shop_closed':
        return {
          label: 'Shop Closed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <DoorClosed className="h-3 w-3" />
        };
      default:
        return {
          label: 'Not Assessed',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <HelpCircle className="h-3 w-3" />
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-1' : ''} flex items-center gap-1`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
