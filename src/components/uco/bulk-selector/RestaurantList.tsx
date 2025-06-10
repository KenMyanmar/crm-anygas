
import { Building2 } from 'lucide-react';
import { Restaurant } from '@/hooks/useRestaurants';
import { RestaurantListItem } from './RestaurantListItem';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurants: string[];
  onRestaurantToggle: (restaurantId: string, checked: boolean | string) => void;
}

export const RestaurantList = ({
  restaurants,
  selectedRestaurants,
  onRestaurantToggle
}: RestaurantListProps) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No restaurants found matching your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {restaurants.map((restaurant) => (
        <RestaurantListItem
          key={restaurant.id}
          restaurant={restaurant}
          isSelected={selectedRestaurants.includes(restaurant.id)}
          onToggle={onRestaurantToggle}
        />
      ))}
    </div>
  );
};
