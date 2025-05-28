
import { RestaurantWithLead } from '@/types/visits';
import RestaurantItem from './RestaurantItem';

interface RestaurantListProps {
  restaurants: RestaurantWithLead[];
  selectedRestaurants: string[];
  onRestaurantToggle: (restaurantId: string, checked: boolean) => void;
}

const RestaurantList = ({
  restaurants,
  selectedRestaurants,
  onRestaurantToggle
}: RestaurantListProps) => {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={restaurant}
          isSelected={selectedRestaurants.includes(restaurant.id)}
          onToggle={onRestaurantToggle}
        />
      ))}
    </div>
  );
};

export default RestaurantList;
