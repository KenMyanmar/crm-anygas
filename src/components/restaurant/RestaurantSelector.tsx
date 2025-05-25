
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Search, Plus } from 'lucide-react';

interface RestaurantData {
  id?: string;
  name: string;
  address: string;
  township: string;
  phone: string;
  contact_person: string;
  remarks: string;
}

interface RestaurantSelectorProps {
  onRestaurantSelect: (restaurant: RestaurantData & { isNew: boolean }) => void;
  selectedRestaurant?: RestaurantData & { isNew: boolean };
}

const RestaurantSelector = ({ onRestaurantSelect, selectedRestaurant }: RestaurantSelectorProps) => {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRestaurantData, setNewRestaurantData] = useState<Omit<RestaurantData, 'id'>>({
    name: '',
    address: '',
    township: '',
    phone: '',
    contact_person: '',
    remarks: '',
  });

  const { restaurants, isLoading } = useRestaurants();

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExistingRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      onRestaurantSelect({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address || '',
        township: restaurant.township || '',
        phone: restaurant.phone || '',
        contact_person: restaurant.contact_person || '',
        remarks: restaurant.remarks || '',
        isNew: false,
      });
    }
  };

  const handleNewRestaurantChange = (field: keyof typeof newRestaurantData, value: string) => {
    const updatedData = { ...newRestaurantData, [field]: value };
    setNewRestaurantData(updatedData);
    onRestaurantSelect({
      ...updatedData,
      isNew: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'existing' ? 'default' : 'outline'}
          onClick={() => setMode('existing')}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          Select Existing Restaurant
        </Button>
        <Button
          type="button"
          variant={mode === 'new' ? 'default' : 'outline'}
          onClick={() => setMode('new')}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Restaurant
        </Button>
      </div>

      {mode === 'existing' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Restaurants</Label>
            <Input
              id="search"
              placeholder="Search by name, township, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant">Select Restaurant *</Label>
            {isLoading ? (
              <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                Loading restaurants...
              </div>
            ) : (
              <Select
                value={selectedRestaurant && !selectedRestaurant.isNew ? selectedRestaurant.id : ''}
                onValueChange={handleExistingRestaurantSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRestaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.township} ({restaurant.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedRestaurant && !selectedRestaurant.isNew && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {selectedRestaurant.name}
                  </div>
                  <div>
                    <strong>Township:</strong> {selectedRestaurant.township || 'N/A'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedRestaurant.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Contact Person:</strong> {selectedRestaurant.contact_person || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Restaurant Name *</Label>
              <Input
                id="new-name"
                value={newRestaurantData.name}
                onChange={(e) => handleNewRestaurantChange('name', e.target.value)}
                placeholder="Enter restaurant name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-township">Township *</Label>
              <Input
                id="new-township"
                value={newRestaurantData.township}
                onChange={(e) => handleNewRestaurantChange('township', e.target.value)}
                placeholder="Enter township"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">Phone Number</Label>
              <Input
                id="new-phone"
                value={newRestaurantData.phone}
                onChange={(e) => handleNewRestaurantChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-contact">Contact Person</Label>
              <Input
                id="new-contact"
                value={newRestaurantData.contact_person}
                onChange={(e) => handleNewRestaurantChange('contact_person', e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-address">Address</Label>
            <Input
              id="new-address"
              value={newRestaurantData.address}
              onChange={(e) => handleNewRestaurantChange('address', e.target.value)}
              placeholder="Enter full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-remarks">Remarks</Label>
            <Textarea
              id="new-remarks"
              value={newRestaurantData.remarks}
              onChange={(e) => handleNewRestaurantChange('remarks', e.target.value)}
              placeholder="Enter any additional notes or remarks"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSelector;
