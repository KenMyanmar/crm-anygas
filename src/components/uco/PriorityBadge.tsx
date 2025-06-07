
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle, Circle, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'confirmed' | 'high' | 'medium' | 'low' | 'skip';
  size?: 'sm' | 'default';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'default' }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <Star className="h-3 w-3 fill-current" />
        };
      case 'high':
        return {
          label: 'High',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'medium':
        return {
          label: 'Medium',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Circle className="h-3 w-3" />
        };
      case 'low':
        return {
          label: 'Low',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Circle className="h-3 w-3" />
        };
      case 'skip':
        return {
          label: 'Skip',
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <Minus className="h-3 w-3" />
        };
      default:
        return {
          label: 'Medium',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Circle className="h-3 w-3" />
        };
    }
  };

  const config = getPriorityConfig(priority);
  
  return (
    <Badge 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-1' : ''} flex items-center gap-1`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
