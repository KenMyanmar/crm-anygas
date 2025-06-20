
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Plus, CheckCircle, Map, Truck } from 'lucide-react';
import { useNearbyRestaurants } from '@/hooks/useNearbyRestaurants';
import { NearbyRestaurantMap } from './NearbyRestaurantMap';
import { toast } from 'sonner';

interface NearbyRestaurantFinderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation?: { lat: number; lng: number; name?: string };
  onRestaurantsAdded?: () => void;
  ucoMode?: boolean;
  searchFilters?: {
    businessType: string;
    minEstimatedVolume: string;
    collectionFrequency: string;
  };
}

export const NearbyRestaurantFinder = ({
  open,
  onOpenChange,
  currentLocation,
  onRestaurantsAdded,
  ucoMode = false,
  searchFilters
}: NearbyRestaurantFinderProps) => {
  const [searchRadius, setSearchRadius] = useState(3000);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [showMap, setShowMap] = useState(true);

  const {
    loading,
    restaurants,
    selectedRestaurants,
    findNearbyRestaurants,
    toggleRestaurantSelection,
    selectAllNewRestaurants,
    clearSelection,
    addSelectedToDatabase
  } = useNearbyRestaurants();

  const handleSearch = async () => {
    let lat: number, lng: number;

    if (customLat && customLng) {
      lat = parseFloat(customLat);
      lng = parseFloat(customLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Please enter valid coordinates');
        return;
      }
    } else if (currentLocation) {
      lat = currentLocation.lat;
      lng = currentLocation.lng;
    } else {
      toast.error('Please provide location coordinates');
      return;
    }

    await findNearbyRestaurants(lat, lng, searchRadius);
  };

  const handleAddSelected = async () => {
    const success = await addSelectedToDatabase();
    if (success && onRestaurantsAdded) {
      onRestaurantsAdded();
    }
  };

  const handleRestaurantMapClick = (restaurant: any) => {
    if (!restaurant.is_existing) {
      toggleRestaurantSelection(restaurant.place_id);
    }
  };

  // Filter restaurants based on UCO criteria if in UCO mode
  const filteredRestaurants = ucoMode ? restaurants.filter(restaurant => {
    // Apply UCO-specific filtering logic here
    return true; // For now, show all
  }) : restaurants;

  const newRestaurants = filteredRestaurants.filter(r => !r.is_existing);
  const existingRestaurants = filteredRestaurants.filter(r => r.is_existing);

  const searchLocation = customLat && customLng 
    ? { lat: parseFloat(customLat), lng: parseFloat(customLng) }
    : currentLocation;

  const getUcoEstimatedVolume = (restaurant: any) => {
    // UCO volume estimation logic based on restaurant type and rating
    if (restaurant.types?.includes('fast_food') || restaurant.types?.includes('meal_takeaway')) {
      return '30-50 L/month';
    } else if (restaurant.rating && restaurant.rating >= 4.0) {
      return '20-40 L/month';
    }
    return '10-25 L/month';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {ucoMode ? <Truck className="h-5 w-5 text-blue-500" /> : <MapPin className="h-5 w-5 text-blue-500" />}
              <span>{ucoMode ? 'UCO Collection Territory Discovery' : 'Find Nearby Restaurants'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-1"
            >
              <Map className="h-4 w-4" />
              <span>{showMap ? 'Hide' : 'Show'} Map</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Search Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium">Search Radius (meters)</label>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                min="1000"
                max="5000"
                step="500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Custom Latitude</label>
              <Input
                type="number"
                step="any"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder={currentLocation?.lat.toString() || "Enter latitude"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Custom Longitude</label>
              <Input
                type="number"
                step="any"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                placeholder={currentLocation?.lng.toString() || "Enter longitude"}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : ucoMode ? 'Find UCO Prospects' : 'Find Restaurants'}
              </Button>
            </div>
          </div>

          {/* Current Location Info */}
          {currentLocation && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {ucoMode ? 'Collection route center' : 'Current location'}: {currentLocation.name || 'Selected location'} 
                ({currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)})
              </span>
            </div>
          )}

          {/* Map View */}
          {showMap && searchLocation && filteredRestaurants.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted/30 border-b">
                <h3 className="font-medium flex items-center space-x-2">
                  <Map className="h-4 w-4" />
                  <span>{ucoMode ? 'UCO Collection Territory' : 'Restaurant Locations'}</span>
                  <Badge variant="outline" className="ml-2">
                    {filteredRestaurants.length} found
                  </Badge>
                </h3>
              </div>
              <NearbyRestaurantMap
                centerLocation={searchLocation}
                restaurants={filteredRestaurants}
                onRestaurantClick={handleRestaurantMapClick}
                selectedRestaurants={selectedRestaurants}
              />
            </div>
          )}

          {/* Results Summary */}
          {filteredRestaurants.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Badge variant="outline">
                  {filteredRestaurants.length} total found
                </Badge>
                <Badge variant="secondary">
                  {newRestaurants.length} new {ucoMode ? 'prospects' : 'restaurants'}
                </Badge>
                <Badge variant="default">
                  {existingRestaurants.length} already in database
                </Badge>
              </div>
              
              {newRestaurants.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllNewRestaurants}>
                    Select All New
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                  {selectedRestaurants.length > 0 && (
                    <Button onClick={handleAddSelected} disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Selected ({selectedRestaurants.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Table */}
          {filteredRestaurants.length > 0 && (
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Township</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    {ucoMode && <TableHead>Est. UCO Volume</TableHead>}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.map((restaurant) => (
                    <TableRow 
                      key={restaurant.place_id}
                      className={restaurant.is_existing ? 'bg-muted/30' : ''}
                    >
                      <TableCell>
                        {restaurant.is_existing ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Checkbox
                            checked={selectedRestaurants.includes(restaurant.place_id)}
                            onCheckedChange={() => toggleRestaurantSelection(restaurant.place_id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{restaurant.address}</TableCell>
                      <TableCell>{restaurant.township}</TableCell>
                      <TableCell>{restaurant.phone || '—'}</TableCell>
                      <TableCell>
                        {restaurant.rating ? (
                          <div className="flex items-center space-x-1">
                            <span>{restaurant.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({restaurant.user_ratings_total})
                            </span>
                          </div>
                        ) : '—'}
                      </TableCell>
                      {ucoMode && (
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getUcoEstimatedVolume(restaurant)}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        {restaurant.is_existing ? (
                          <Badge variant="default">In Database</Badge>
                        ) : (
                          <Badge variant="secondary">{ucoMode ? 'UCO Prospect' : 'New'}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredRestaurants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {ucoMode ? 'UCO prospects' : 'restaurants'} found</p>
              <p className="text-sm">Try searching with a larger radius or different location</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
