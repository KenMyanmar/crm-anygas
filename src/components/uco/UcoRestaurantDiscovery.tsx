
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRestaurants } from '@/hooks/useRestaurants';
import { NearbyRestaurantFinder } from '@/components/uco/NearbyRestaurantFinder';

const UcoRestaurantDiscovery = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    businessType: 'all',
    minEstimatedVolume: 'any',
    collectionFrequency: 'any'
  });
  
  const { restaurants, isLoading } = useRestaurants();

  // Filter restaurants for UCO collection potential
  const ucoRestaurants = restaurants?.filter(restaurant => 
    restaurant.business_types?.includes('uco_prospect') || 
    restaurant.business_types?.includes('uco_supplier') ||
    restaurant.uco_supplier_status !== 'not_assessed'
  ) || [];

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    const restaurant = restaurants?.find(r => r.id === restaurantId);
    if (restaurant) {
      // Generate coordinates based on township for demo
      const coordinates = generateCoordinatesForTownship(restaurant.township);
      setSelectedLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        name: restaurant.name
      });
    }
  };

  // Helper function to generate realistic Myanmar coordinates
  const generateCoordinatesForTownship = (township: string | undefined) => {
    const baseCoords = { lat: 16.8661, lng: 96.1951 }; // Yangon center
    const variation = 0.1;
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * variation,
      lng: baseCoords.lng + (Math.random() - 0.5) * variation
    };
  };

  const handleFindNearbyRestaurants = () => {
    if (selectedLocation) {
      setShowNearbyFinder(true);
    }
  };

  const handleRestaurantsAdded = () => {
    setShowNearbyFinder(false);
  };

  return (
    <div className="space-y-6">
      {/* UCO-Specific Header */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>UCO Collection Territory Expansion</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Discover new restaurants for UCO collection optimization. Find establishments within collection routes
            and estimate waste oil potential for efficient route planning.
          </p>
        </CardHeader>
      </Card>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>UCO Discovery Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type Focus</label>
              <Select value={searchFilters.businessType} onValueChange={(value) => 
                setSearchFilters(prev => ({ ...prev, businessType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Restaurant Types</SelectItem>
                  <SelectItem value="fast_food">Fast Food (High Volume)</SelectItem>
                  <SelectItem value="fine_dining">Fine Dining</SelectItem>
                  <SelectItem value="street_food">Street Food</SelectItem>
                  <SelectItem value="hotel_restaurant">Hotel Restaurants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated UCO Volume</label>
              <Select value={searchFilters.minEstimatedVolume} onValueChange={(value) => 
                setSearchFilters(prev => ({ ...prev, minEstimatedVolume: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Volume</SelectItem>
                  <SelectItem value="high">High (50+ L/month)</SelectItem>
                  <SelectItem value="medium">Medium (20-50 L/month)</SelectItem>
                  <SelectItem value="low">Low (5-20 L/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Frequency</label>
              <Select value={searchFilters.collectionFrequency} onValueChange={(value) => 
                setSearchFilters(prev => ({ ...prev, collectionFrequency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Frequency</SelectItem>
                  <SelectItem value="daily">Daily Collection</SelectItem>
                  <SelectItem value="weekly">Weekly Collection</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Restaurant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span>Select Collection Route Reference Point</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose existing restaurant in your collection route:</label>
              {isLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Loading restaurants...
                </div>
              ) : (
                <Select value={selectedRestaurant} onValueChange={handleRestaurantSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference restaurant for territory expansion" />
                  </SelectTrigger>
                  <SelectContent>
                    {ucoRestaurants.length > 0 ? (
                      ucoRestaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name} - {restaurant.township} 
                          {restaurant.uco_supplier_status && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {restaurant.uco_supplier_status.replace('_', ' ')}
                            </Badge>
                          )}
                        </SelectItem>
                      ))
                    ) : (
                      restaurants?.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name} - {restaurant.township} (Potential)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleFindNearbyRestaurants}
                disabled={!selectedLocation}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Discover UCO Prospects
              </Button>
            </div>
          </div>

          {selectedLocation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Collection Route Center:</span>
                  <span className="text-sm text-blue-700">{selectedLocation.name}</span>
                </div>
                <Badge variant="secondary">5km Search Radius</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Searching for restaurants within optimal collection distance for route efficiency
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UCO Business Intelligence */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium text-gray-900">UCO Collection Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">1</span>
                </div>
                <p className="text-center">Smart restaurant discovery with UCO volume estimation based on business type and size</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <p className="text-center">Route optimization suggestions and collection frequency recommendations</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">3</span>
                </div>
                <p className="text-center">Automatic lead scoring and integration with existing collection plans</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced UCO Nearby Restaurant Finder */}
      <NearbyRestaurantFinder
        open={showNearbyFinder}
        onOpenChange={setShowNearbyFinder}
        currentLocation={selectedLocation || undefined}
        onRestaurantsAdded={handleRestaurantsAdded}
        ucoMode={true}
        searchFilters={searchFilters}
      />
    </div>
  );
};

export default UcoRestaurantDiscovery;
