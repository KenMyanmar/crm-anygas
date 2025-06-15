
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { PriorityBadge } from '@/components/uco/PriorityBadge';
import { MapPin, Droplets, TrendingUp } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  township?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  uco_supplier_status?: string;
  avg_uco_volume_kg?: number;
  last_uco_collection_date?: string;
  uco_price_per_kg?: number;
}

interface RestaurantListItemProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onToggle: (restaurantId: string, checked: boolean) => void;
  expectedVolume?: number;
  onExpectedVolumeChange?: (restaurantId: string, volume: number) => void;
}

export const RestaurantListItem = ({
  restaurant,
  isSelected,
  onToggle,
  expectedVolume,
  onExpectedVolumeChange
}: RestaurantListItemProps) => {
  const [localExpectedVolume, setLocalExpectedVolume] = useState(expectedVolume?.toString() || '');

  const handleVolumeChange = (value: string) => {
    setLocalExpectedVolume(value);
    const numValue = parseFloat(value) || 0;
    onExpectedVolumeChange?.(restaurant.id, numValue);
  };

  const getUcoStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'potential': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggle(restaurant.id, !!checked)}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{restaurant.name}</h3>
              <div className="flex items-center space-x-2">
                {restaurant.uco_supplier_status && (
                  <Badge variant="outline" className={getUcoStatusColor(restaurant.uco_supplier_status)}>
                    {restaurant.uco_supplier_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
                <UcoStatusBadge status="not_assessed" />
                <PriorityBadge priority="medium" />
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {restaurant.township || 'Unknown Township'}
              </span>
              {restaurant.contact_person && (
                <span>{restaurant.contact_person}</span>
              )}
            </div>

            {/* UCO History Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {restaurant.avg_uco_volume_kg && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span>Avg: {restaurant.avg_uco_volume_kg}kg</span>
                </div>
              )}
              {restaurant.uco_price_per_kg && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Price: {restaurant.uco_price_per_kg} MMK/kg</span>
                </div>
              )}
              {restaurant.last_uco_collection_date && (
                <div className="text-xs text-muted-foreground">
                  Last: {new Date(restaurant.last_uco_collection_date).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Expected Volume Input - Only show when selected */}
            {isSelected && (
              <div className="mt-3 p-3 bg-muted/30 rounded-md">
                <Label htmlFor={`volume-${restaurant.id}`} className="text-sm font-medium">
                  Expected Collection Volume (kg)
                </Label>
                <Input
                  id={`volume-${restaurant.id}`}
                  type="number"
                  placeholder="Enter expected volume..."
                  value={localExpectedVolume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="mt-1"
                  min="0"
                  step="0.1"
                />
                {restaurant.avg_uco_volume_kg && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggestion: {restaurant.avg_uco_volume_kg}kg (based on history)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
