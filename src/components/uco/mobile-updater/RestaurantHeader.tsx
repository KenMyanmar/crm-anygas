
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { UcoStatusBadge } from '../UcoStatusBadge';
import { PriorityBadge } from '../PriorityBadge';
import { UcoCollectionItem, UcoStatus } from '@/types/uco';

interface RestaurantHeaderProps {
  restaurant: UcoCollectionItem['restaurant'];
  routeSequence?: number;
  currentStatus: UcoStatus;
  priority: UcoCollectionItem['collection_priority'];
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  restaurant,
  routeSequence,
  currentStatus,
  priority
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{restaurant.township}</span>
            {routeSequence && (
              <Badge variant="outline" className="text-xs">
                #{routeSequence}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <UcoStatusBadge status={currentStatus} size="sm" />
          <PriorityBadge priority={priority} size="sm" />
        </div>
      </div>
    </CardHeader>
  );
};
