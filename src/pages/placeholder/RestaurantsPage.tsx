
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Search, Upload, MoreHorizontal, Phone, MapPin } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  township: string | null;
  address: string | null;
  phone: string | null;
  contact_person: string | null;
}

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setRestaurants(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching restaurants",
          description: error.message || "Failed to load restaurants",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchLower) ||
      (restaurant.township && restaurant.township.toLowerCase().includes(searchLower)) ||
      (restaurant.phone && restaurant.phone.toLowerCase().includes(searchLower))
    );
  });

  const handleViewRestaurant = (id: string) => {
    // This would navigate to a restaurant detail page in the future
    toast({
      title: "Feature coming soon",
      description: "Restaurant details view will be available soon",
    });
  };

  const handleCreateLead = (restaurantId: string) => {
    // This would navigate to a lead creation page with the restaurant pre-selected
    toast({
      title: "Feature coming soon",
      description: "Lead creation for restaurants will be available soon",
    });
  };

  const handleImportClick = () => {
    navigate('/admin/import');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={handleImportClick}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            )}
            <Button className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Restaurant
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Management</CardTitle>
            <CardDescription>
              View, search and manage your restaurants database. Create new restaurants or generate leads from existing ones.
            </CardDescription>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, township or phone..." 
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading restaurants...</div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                {searchQuery ? "No restaurants found matching your search" : "No restaurants found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Township</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell 
                          className="font-medium" 
                          onClick={() => handleViewRestaurant(restaurant.id)}
                        >
                          {restaurant.name}
                        </TableCell>
                        <TableCell onClick={() => handleViewRestaurant(restaurant.id)}>
                          {restaurant.township || "-"}
                        </TableCell>
                        <TableCell onClick={() => handleViewRestaurant(restaurant.id)}>
                          {restaurant.contact_person || "-"}
                        </TableCell>
                        <TableCell onClick={() => handleViewRestaurant(restaurant.id)}>
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            {restaurant.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewRestaurant(restaurant.id)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateLead(restaurant.id)}>
                                Create lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantsPage;
