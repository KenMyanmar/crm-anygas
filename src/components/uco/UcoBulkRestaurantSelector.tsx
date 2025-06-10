
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Building2, MapPin, Droplets, Search, Filter } from 'lucide-react';

interface UcoBulkRestaurantSelectorProps {
  onConfirm: (restaurantIds: string[]) => void;
  onCancel: () => void;
  selectedTownship?: string;
}

export const UcoBulkRestaurantSelector = ({
  onConfirm,
  onCancel,
  selectedTownship
}: UcoBulkRestaurantSelectorProps) => {
  const { restaurants, isLoading } = useRestaurants();
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState(selectedTownship || 'all');
  const [ucoStatusFilter, setUcoStatusFilter] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTownship = townshipFilter === 'all' || restaurant.township === townshipFilter;
      const matchesUcoStatus = ucoStatusFilter === 'all' || restaurant.uco_supplier_status === ucoStatusFilter;
      
      return matchesSearch && matchesTownship && matchesUcoStatus;
    }) || [];
  }, [restaurants, searchTerm, townshipFilter, ucoStatusFilter]);

  const uniqueTownships = [...new Set(restaurants?.map(r => r.township).filter(Boolean) || [])];

  const handleRestaurantToggle = (restaurantId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectedRestaurants(prev => 
      isChecked 
        ? [...prev, restaurantId]
        : prev.filter(id => id !== restaurantId)
    );
  };

  const handleSelectAll = () => {
    if (selectedRestaurants.length === filteredRestaurants.length) {
      setSelectedRestaurants([]);
    } else {
      setSelectedRestaurants(filteredRestaurants.map(r => r.id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Select Restaurants for UCO Collection</h3>
            <p className="text-sm text-muted-foreground">
              Choose restaurants to include in your collection plan
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {selectedRestaurants.length} selected
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={townshipFilter} onValueChange={setTownshipFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by township" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Townships</SelectItem>
            {uniqueTownships.map(township => (
              <SelectItem key={township} value={township}>{township}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ucoStatusFilter} onValueChange={setUcoStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="UCO Supplier Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active Supplier</SelectItem>
            <SelectItem value="potential">Potential Supplier</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Select All Control */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="select-all"
            checked={selectedRestaurants.length === filteredRestaurants.length && filteredRestaurants.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Select All ({filteredRestaurants.length} restaurants)
          </label>
        </div>
        <Badge variant="secondary">
          {filteredRestaurants.length} of {restaurants?.length || 0} restaurants
        </Badge>
      </div>

      {/* Restaurant List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredRestaurants.map((restaurant) => (
          <Card 
            key={restaurant.id}
            className={`cursor-pointer transition-all ${
              selectedRestaurants.includes(restaurant.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                : 'hover:shadow-sm'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedRestaurants.includes(restaurant.id)}
                  onCheckedChange={(checked) => handleRestaurantToggle(restaurant.id, checked)}
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
        ))}
        
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No restaurants found matching your filters</p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 -mx-6 -mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Droplets className="h-4 w-4 mr-1" />
              {selectedRestaurants.length} restaurant{selectedRestaurants.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={() => onConfirm(selectedRestaurants)}
              disabled={selectedRestaurants.length === 0}
              className="min-w-[140px]"
            >
              Add {selectedRestaurants.length} to Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
