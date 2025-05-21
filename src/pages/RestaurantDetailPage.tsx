
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Phone, MapPin, Edit, Calendar, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import RestaurantInfo from '@/components/restaurants/RestaurantInfo';
import RestaurantLeads from '@/components/restaurants/RestaurantLeads';
import RestaurantActivity from '@/components/restaurants/RestaurantActivity';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setRestaurant(data);
      } catch (error: any) {
        toast({
          title: "Error fetching restaurant details",
          description: error.message || "Failed to load restaurant details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading restaurant details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-muted-foreground">Restaurant not found</p>
          <Button asChild>
            <Link to="/restaurants">Back to Restaurants</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild size="sm">
              <Link to="/restaurants">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link to={`/restaurants/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Restaurant
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 text-sm">
          {restaurant.township && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
              <span>{restaurant.township}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-muted-foreground mr-1" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4">
            <RestaurantInfo restaurant={restaurant} />
          </TabsContent>
          <TabsContent value="leads" className="space-y-4">
            <RestaurantLeads restaurantId={id as string} />
          </TabsContent>
          <TabsContent value="activity" className="space-y-4">
            <RestaurantActivity restaurantId={id as string} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantDetailPage;
