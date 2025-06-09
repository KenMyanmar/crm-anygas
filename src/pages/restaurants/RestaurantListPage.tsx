
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Search, Plus, MapPin, Phone, User } from 'lucide-react';

const RestaurantListPage = () => {
  const navigate = useNavigate();
  const { restaurants, isLoading } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRestaurants = restaurants?.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading restaurants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage your restaurant database and customer relationships
          </p>
        </div>
        <Button onClick={() => navigate('/restaurants/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search restaurants by name or township..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Restaurant List */}
      <div className="grid gap-4">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          {restaurant.township && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {restaurant.township}
                            </span>
                          )}
                          {restaurant.contact_person && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {restaurant.contact_person}
                            </span>
                          )}
                          {restaurant.phone && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {restaurant.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="outline">
                        {restaurant.gas_customer_status || 'Prospect'}
                      </Badge>
                      <Badge variant="outline">
                        {restaurant.uco_supplier_status || 'Not Assessed'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No restaurants match your search criteria.' : 'Get started by adding your first restaurant.'}
              </p>
              <Button onClick={() => navigate('/restaurants/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RestaurantListPage;
