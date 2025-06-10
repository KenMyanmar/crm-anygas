import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import RestaurantInfo from '@/components/restaurants/RestaurantInfo';
import RestaurantActivity from '@/components/restaurants/RestaurantActivity';
import RestaurantLeads from '@/components/restaurants/RestaurantLeads';
import RestaurantOrders from '@/components/restaurants/RestaurantOrders';
import RestaurantVisits from '@/components/restaurants/RestaurantVisits';
import RestaurantTimeline from '@/components/restaurants/RestaurantTimeline';
import RestaurantNotes from '@/components/restaurants/RestaurantNotes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Edit, Package, MapPin, FileText, Calendar, Users, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RestaurantUcoInfo } from '@/components/restaurants/RestaurantUcoInfo';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Map the data to match the Restaurant interface
      const restaurantData: Restaurant = {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        township: data.township || '',
        address: data.address || '',
        contact_person: data.contact_person || '',
        remarks: data.remarks || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        salesperson_id: data.salesperson_id
      };

      setRestaurant(restaurantData);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Restaurant not found</h2>
          <p className="text-gray-600 mt-2">The restaurant you're looking for doesn't exist.</p>
          <Link to="/restaurants" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Restaurants
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/restaurants">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Restaurants
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
              <p className="text-muted-foreground">
                {restaurant.township && `${restaurant.township} • `}
                {restaurant.contact_person && `Contact: ${restaurant.contact_person}`}
              </p>
            </div>
          </div>
          <Link to={`/restaurants/${restaurant.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Restaurant
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Info
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="uco" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              UCO
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <RestaurantInfo restaurant={restaurant} />
            <RestaurantActivity restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="orders">
            <RestaurantOrders restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="visits">
            <RestaurantVisits restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="uco">
            <RestaurantUcoInfo restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="leads">
            <RestaurantLeads restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <RestaurantTimeline restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="notes">
            <RestaurantNotes restaurantId={restaurant.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantDetailPage;
