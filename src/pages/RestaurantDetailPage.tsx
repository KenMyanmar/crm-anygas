import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { hasAdminAccess } from '@/utils/roleUtils';
import { deleteRestaurant } from '@/utils/restaurantDeleteUtils';
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
import { ChevronLeft, Edit, Package, MapPin, FileText, Calendar, Users, Truck, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RestaurantUcoInfo } from '@/components/restaurants/RestaurantUcoInfo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteRestaurant = async () => {
    if (!restaurant || !id) return;

    setIsDeleting(true);
    try {
      const result = await deleteRestaurant(id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Navigate back to restaurants list after successful deletion
        navigate('/restaurants');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to delete restaurant",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
          <div className="flex items-center space-x-2">
            <Link to={`/restaurants/${restaurant.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Restaurant
              </Button>
            </Link>
            {hasAdminAccess(profile?.role) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Restaurant'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{restaurant.name}"? This action cannot be undone and will permanently delete the restaurant and all related data including orders, leads, visits, and meetings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteRestaurant}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
