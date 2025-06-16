
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRestaurants } from '@/hooks/useRestaurants';
import { NearbyRestaurantFinder } from '@/components/uco/NearbyRestaurantFinder';

const RestaurantLeads = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  
  const { restaurants, isLoading } = useRestaurants();

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      // For now, we'll use dummy coordinates since the restaurants table doesn't have lat/lng
      // In a real implementation, you'd geocode the address or store coordinates
      setSelectedLocation({
        lat: 16.8661 + (Math.random() - 0.5) * 0.1, // Yangon area with some variation
        lng: 96.1951 + (Math.random() - 0.5) * 0.1,
        name: restaurant.name
      });
    }
  };

  const handleFindNearbyRestaurants = () => {
    if (selectedLocation) {
      setShowNearbyFinder(true);
    }
  };

  const handleRestaurantsAdded = () => {
    // Refresh restaurants list or show success message
    setShowNearbyFinder(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span>Select Reference Restaurant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose an existing restaurant as reference point:</label>
              {isLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Loading restaurants...
                </div>
              ) : (
                <Select value={selectedRestaurant} onValueChange={handleRestaurantSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant to find nearby establishments" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} - {restaurant.township} ({restaurant.phone || 'No phone'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleFindNearbyRestaurants}
                disabled={!selectedLocation}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Nearby Restaurants
              </Button>
            </div>
          </div>

          {selectedLocation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Reference Point Selected:</span>
                <span className="text-sm text-blue-700">{selectedLocation.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                We'll search for restaurants within 5km radius of this location
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-900">How it works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p>Select an existing restaurant from your database as a reference point</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <p>Click "Find Nearby Restaurants" to discover establishments within 5km</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <p>Select restaurants from the map and table, then add them to your database</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Restaurant Finder Dialog */}
      <NearbyRestaurantFinder
        open={showNearbyFinder}
        onOpenChange={setShowNearbyFinder}
        currentLocation={selectedLocation || undefined}
        onRestaurantsAdded={handleRestaurantsAdded}
      />
    </div>
  );
};

export default RestaurantLeads;
