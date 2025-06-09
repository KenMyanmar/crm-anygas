import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUcoCollectionPlans, useUcoCollectionItems } from '@/hooks/useUcoCollectionPlans';
import { UcoRouteOptimizer as ExistingOptimizer } from '@/components/uco/UcoRouteOptimizer';
import { ArrowLeft, Route, Truck, MapPin, Clock } from 'lucide-react';

const UcoRouteOptimizer = () => {
  const navigate = useNavigate();
  const { plans } = useUcoCollectionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const { items } = useUcoCollectionItems(selectedPlanId);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  // Mock data for demonstration when no real data is available
  const mockStops = [
    {
      id: '1',
      restaurant: {
        name: 'Restaurant A',
        township: 'Yankin',
        address: '123 Main St'
      },
      uco_status: 'have_uco',
      collection_priority: 'high',
      expected_volume_kg: 25,
      route_sequence: 1,
      estimated_time_minutes: 20
    },
    {
      id: '2',
      restaurant: {
        name: 'Restaurant B', 
        township: 'Yankin',
        address: '456 Oak Ave'
      },
      uco_status: 'have_uco',
      collection_priority: 'medium',
      expected_volume_kg: 15,
      route_sequence: 2,
      estimated_time_minutes: 15
    }
  ];

  // Use real data if available, otherwise use mock data
  const routeStops = items && items.length > 0 ? items.map(item => ({
    id: item.id,
    restaurant: item.restaurant || { name: 'Unknown Restaurant', township: 'Unknown', address: '' },
    uco_status: item.uco_status || 'not_assessed',
    collection_priority: item.collection_priority || 'medium',
    expected_volume_kg: item.expected_volume_kg || 0,
    route_sequence: item.route_sequence || 1,
    estimated_time_minutes: 15
  })) : mockStops;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UCO Route Optimizer</h1>
            <p className="text-muted-foreground">
              Optimize truck routes for efficient UCO collection
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2" />
              Select Collection Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans?.map((plan) => (
              <div 
                key={plan.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPlanId === plan.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{plan.plan_name}</p>
                    <p className="text-sm text-muted-foreground">{plan.township}</p>
                  </div>
                  <Badge variant="outline">
                    {plan.plan_date ? new Date(plan.plan_date).toLocaleDateString() : 'No date'}
                  </Badge>
                </div>
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No collection plans available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/uco/planner')}
                >
                  Create Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Route Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {routeStops.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Estimated time: {Math.round(routeStops.length * 0.5)} hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{routeStops.length} stops</span>
                      </div>
                    </div>
                    <Button>Optimize Route</Button>
                  </div>
                  
                  <ExistingOptimizer stops={routeStops} />
                  
                  <div className="space-y-2">
                    {routeStops
                      .sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0))
                      .map((stop, index) => (
                      <div key={stop.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stop.restaurant?.name}</p>
                          <p className="text-sm text-muted-foreground">{stop.restaurant?.township}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">
                            {stop.collection_priority}
                          </Badge>
                          {stop.expected_volume_kg && (
                            <Badge variant="secondary">
                              {stop.expected_volume_kg}kg
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No collection items available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a plan or create a new collection plan to optimize routes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UcoRouteOptimizer;
