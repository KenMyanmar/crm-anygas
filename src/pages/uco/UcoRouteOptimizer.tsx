
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
          {selectedPlanId ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Route Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items && items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Estimated time: {Math.round(items.length * 0.5)} hours</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{items.length} stops</span>
                        </div>
                      </div>
                      <Button>Optimize Route</Button>
                    </div>
                    
                    <ExistingOptimizer />
                    
                    <div className="space-y-2">
                      {items
                        .sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0))
                        .map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.restaurant?.name}</p>
                            <p className="text-sm text-muted-foreground">{item.restaurant?.township}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">
                              {item.collection_priority}
                            </Badge>
                            {item.expected_volume_kg && (
                              <Badge variant="secondary">
                                {item.expected_volume_kg}kg
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
                    <p className="text-muted-foreground">No collection items in this plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Route className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Collection Plan</h3>
                <p className="text-muted-foreground">
                  Choose a collection plan from the left to optimize its route
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UcoRouteOptimizer;
