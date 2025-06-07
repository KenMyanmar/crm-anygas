
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Droplets, TrendingUp, MapPin, Clock } from 'lucide-react';

interface DualBusinessVisitPlannerProps {
  restaurants: any[];
  onCreateVisitPlan: (plan: any) => void;
}

export const DualBusinessVisitPlanner: React.FC<DualBusinessVisitPlannerProps> = ({
  restaurants,
  onCreateVisitPlan,
}) => {
  const [visitType, setVisitType] = useState<'combined' | 'gas_focused' | 'uco_focused'>('combined');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<Record<string, any>>({});

  const getBusinessIcon = (businessType: string) => {
    switch (businessType) {
      case 'dual_business':
        return <div className="flex"><Flame className="h-4 w-4 text-orange-500" /><Droplets className="h-4 w-4 text-blue-500" /></div>;
      case 'gas_only':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'uco_only':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (visitType === 'combined') return restaurant.business_category === 'dual_business';
    if (visitType === 'gas_focused') return ['gas_only', 'dual_business', 'prospect'].includes(restaurant.business_category);
    if (visitType === 'uco_focused') return ['uco_only', 'dual_business'].includes(restaurant.business_category);
    return true;
  });

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurants(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const setObjectiveForRestaurant = (restaurantId: string, type: 'gas' | 'uco', objective: string) => {
    setObjectives(prev => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        [`${type}_objective`]: objective
      }
    }));
  };

  const handleCreatePlan = () => {
    const planData = {
      visit_type: visitType,
      restaurants: selectedRestaurants.map(id => ({
        restaurant_id: id,
        objectives: objectives[id] || {}
      })),
      estimated_duration: selectedRestaurants.length * (visitType === 'combined' ? 45 : 30)
    };
    onCreateVisitPlan(planData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <Droplets className="h-5 w-5 text-blue-500" />
            <span>Dual Business Visit Planner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={visitType} onValueChange={(value: any) => setVisitType(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="combined">Combined Visits (Most Efficient)</TabsTrigger>
              <TabsTrigger value="gas_focused">Gas-Focused Route</TabsTrigger>
              <TabsTrigger value="uco_focused">UCO Collection Route</TabsTrigger>
            </TabsList>

            <TabsContent value={visitType} className="mt-6">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Select Restaurants ({selectedRestaurants.length} selected)
                  </h3>
                  <Badge variant="outline">
                    Est. Duration: {selectedRestaurants.length * (visitType === 'combined' ? 45 : 30)}min
                  </Badge>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredRestaurants.map(restaurant => (
                    <Card 
                      key={restaurant.id}
                      className={`cursor-pointer transition-all ${
                        selectedRestaurants.includes(restaurant.id) 
                          ? 'ring-2 ring-primary' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleRestaurantSelect(restaurant.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getBusinessIcon(restaurant.business_category)}
                              <h4 className="font-medium">{restaurant.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {restaurant.business_category?.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {restaurant.township}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {restaurant.visits_last_30_days || 0} visits (30d)
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedRestaurants.includes(restaurant.id) && (
                          <div className="mt-4 space-y-3 border-t pt-3">
                            {(visitType === 'combined' || visitType === 'gas_focused') && (
                              <div>
                                <label className="text-sm font-medium text-orange-600">
                                  🔥 Gas Objective:
                                </label>
                                <Select onValueChange={(value) => setObjectiveForRestaurant(restaurant.id, 'gas', value)}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select gas objective" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="initial_pitch">Initial Sales Pitch</SelectItem>
                                    <SelectItem value="follow_up">Follow-up Previous Interest</SelectItem>
                                    <SelectItem value="delivery">Gas Delivery</SelectItem>
                                    <SelectItem value="service_check">Service/Maintenance</SelectItem>
                                    <SelectItem value="competitor_analysis">Check Competitor Activity</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {(visitType === 'combined' || visitType === 'uco_focused') && (
                              <div>
                                <label className="text-sm font-medium text-blue-600">
                                  🛢️ UCO Objective:
                                </label>
                                <Select onValueChange={(value) => setObjectiveForRestaurant(restaurant.id, 'uco', value)}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select UCO objective" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="collect_uco">Collect Available UCO</SelectItem>
                                    <SelectItem value="assess_potential">Assess UCO Generation Potential</SelectItem>
                                    <SelectItem value="negotiate_price">Negotiate Collection Terms</SelectItem>
                                    <SelectItem value="quality_training">Provide UCO Quality Training</SelectItem>
                                    <SelectItem value="competitor_check">Check UCO Competitor Activity</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedRestaurants.length > 0 && (
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setSelectedRestaurants([])}>
                      Clear Selection
                    </Button>
                    <Button onClick={handleCreatePlan}>
                      Create Visit Plan ({selectedRestaurants.length} restaurants)
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
