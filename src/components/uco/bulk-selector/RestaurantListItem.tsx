
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, MapPin } from 'lucide-react';
import { Restaurant } from '@/hooks/useRestaurants';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onToggle: (restaurantId: string, checked: boolean | string) => void;
}

export const RestaurantListItem = ({
  restaurant,
  isSelected,
  onToggle
}: RestaurantListItemProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50/50' 
          : 'hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggle(restaurant.id, checked)}
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{restaurant.name}</h4>
              {restaurant.uco_supplier_status && (
                <Badge variant="outline" className="text-xs">
                  {restaurant.uco_supplier_status}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{restaurant.township}</span>
              </span>
              {restaurant.address && (
                <span>{restaurant.address}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
