
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUcoCollectionPlans, useUcoCollectionItems } from '@/hooks/useUcoCollectionPlans';
import { useAuth } from '@/context/AuthContext';
import { UcoBulkRestaurantSelector } from '@/components/uco/UcoBulkRestaurantSelector';
import { ArrowLeft, Plus, MapPin, Truck, Calendar, Users, Route } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const UcoCollectionPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans } = useUcoCollectionPlans();
  const { items, isLoading: itemsLoading, bulkCreateItems } = useUcoCollectionItems(id);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);

  const plan = plans?.find(p => p.id === id);

  useEffect(() => {
    // Auto-open restaurant selector for empty plans (like visits)
    if (plan && items && items.length === 0) {
      setShowRestaurantSelector(true);
    }
  }, [plan, items]);

  if (!plan) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
          <Button onClick={() => navigate('/uco/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleAddRestaurants = async (restaurantIds: string[]) => {
    const newItems = restaurantIds.map((restaurantId, index) => ({
      plan_id: id!,
      restaurant_id: restaurantId,
      route_sequence: (items?.length || 0) + index + 1,
      uco_status: 'not_assessed' as const,
      collection_priority: 'medium' as const,
    }));

    try {
      await bulkCreateItems.mutateAsync(newItems);
      setShowRestaurantSelector(false);
    } catch (error) {
      toast.error('Failed to add restaurants to plan');
      console.error('Error adding restaurants:', error);
    }
  };

  const isOwner = profile?.id === plan.created_by;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{plan.plan_name}</h1>
            <p className="text-muted-foreground">UCO Collection Plan Details</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowRestaurantSelector(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurants
            </Button>
            <Button onClick={() => navigate(`/uco/routes?plan=${id}`)}>
              <Route className="h-4 w-4 mr-2" />
              Optimize Route
            </Button>
          </div>
        )}
      </div>

      {/* Plan Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Collection Date</p>
                <p className="font-medium">{format(new Date(plan.plan_date), 'EEEE, MMM dd, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Township</p>
                <p className="font-medium">{plan.township}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="font-medium">{plan.driver_name || 'Not assigned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Truck Capacity</p>
                <p className="font-medium">{plan.truck_capacity_kg}kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collection Stops ({items?.length || 0})</span>
            <Badge variant="outline">
              Total Expected: {items?.reduce((sum, item) => sum + (item.expected_volume_kg || 0), 0)}kg
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-8">Loading collection items...</div>
          ) : items && items.length > 0 ? (
            <div className="space-y-3">
              {items
                .sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0))
                .map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.restaurant?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.restaurant?.township} • {item.restaurant?.address}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{item.collection_priority}</Badge>
                    <Badge variant="secondary">{item.uco_status?.replace('_', ' ')}</Badge>
                    {item.expected_volume_kg && (
                      <Badge>{item.expected_volume_kg}kg</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Restaurants Added</h3>
              <p className="text-muted-foreground mb-4">
                Add restaurants to this collection plan to get started
              </p>
              {isOwner && (
                <Button onClick={() => setShowRestaurantSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Restaurants
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Selector Dialog */}
      <Dialog open={showRestaurantSelector} onOpenChange={setShowRestaurantSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Restaurants to Collection Plan</DialogTitle>
          </DialogHeader>
          <UcoBulkRestaurantSelector
            onConfirm={handleAddRestaurants}
            onCancel={() => setShowRestaurantSelector(false)}
            selectedTownship={plan.township}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UcoCollectionPlanDetailPage;
