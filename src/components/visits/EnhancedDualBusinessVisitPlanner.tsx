
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Droplets, TrendingUp, MapPin, Clock, Filter } from 'lucide-react';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { PriorityBadge } from '@/components/uco/PriorityBadge';

interface EnhancedDualBusinessVisitPlannerProps {
  restaurants: any[];
  onCreateVisitPlan: (plan: any) => void;
}

export const EnhancedDualBusinessVisitPlanner: React.FC<EnhancedDualBusinessVisitPlannerProps> = ({
  restaurants,
  onCreateVisitPlan,
}) => {
  const [visitType, setVisitType] = useState<'combined' | 'gas_focused' | 'uco_focused'>('combined');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState({
    township: '',
    ucoStatus: '',
    priority: '',
    businessCategory: '',
  });

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

  // Enhanced filtering logic
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Visit type filter
    let passesVisitType = false;
    if (visitType === 'combined') passesVisitType = restaurant.business_category === 'dual_business';
    else if (visitType === 'gas_focused') passesVisitType = ['gas_only', 'dual_business', 'prospect'].includes(restaurant.business_category);
    else if (visitType === 'uco_focused') passesVisitType = ['uco_only', 'dual_business'].includes(restaurant.business_category);
    
    if (!passesVisitType) return false;

    // Additional filters
    if (filters.township && restaurant.township !== filters.township) return false;
    if (filters.businessCategory && restaurant.business_category !== filters.businessCategory) return false;
    
    return true;
  });

  // Get unique townships for filter
  const uniqueTownships = [...new Set(restaurants.map(r => r.township).filter(Boolean))];

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurants(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const setUcoObjective = (restaurantId: string, objective: string, status: string, priority: string) => {
    setObjectives(prev => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        uco_objective: objective,
        uco_status: status,
        collection_priority: priority,
      }
    }));
  };

  const setGasObjective = (restaurantId: string, objective: string) => {
    setObjectives(prev => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        gas_objective: objective,
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
            <span>Enhanced Dual Business Visit Planner</span>
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
              {/* Enhanced Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Township</label>
                      <Select value={filters.township} onValueChange={(value) => setFilters({...filters, township: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All townships" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All townships</SelectItem>
                          {uniqueTownships.map(township => (
                            <SelectItem key={township} value={township}>{township}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Business Category</label>
                      <Select value={filters.businessCategory} onValueChange={(value) => setFilters({...filters, businessCategory: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All categories</SelectItem>
                          <SelectItem value="dual_business">Dual Business</SelectItem>
                          <SelectItem value="gas_only">Gas Only</SelectItem>
                          <SelectItem value="uco_only">UCO Only</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Select Restaurants ({selectedRestaurants.length} selected)
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {filteredRestaurants.length} restaurants available
                    </Badge>
                    <Badge variant="outline">
                      Est. Duration: {selectedRestaurants.length * (visitType === 'combined' ? 45 : 30)}min
                    </Badge>
                  </div>
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
                            {(visitType === 'combined' || visitType === 'uco_focused') && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-600">
                                  🛢️ UCO Collection Details:
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                  <Select onValueChange={(value) => {
                                    const current = objectives[restaurant.id] || {};
                                    setUcoObjective(restaurant.id, value, current.uco_status, current.collection_priority);
                                  }}>
                                    <SelectTrigger>
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
                                  <div className="grid grid-cols-2 gap-2">
                                    <Select onValueChange={(value) => {
                                      const current = objectives[restaurant.id] || {};
                                      setUcoObjective(restaurant.id, current.uco_objective, value, current.collection_priority);
                                    }}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="UCO Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="have_uco">Have UCO</SelectItem>
                                        <SelectItem value="no_uco_reuse_staff">NO UCO (Reuse/Staff)</SelectItem>
                                        <SelectItem value="no_uco_not_ready">No UCO (Not Ready)</SelectItem>
                                        <SelectItem value="shop_closed">Shop Closed</SelectItem>
                                        <SelectItem value="not_assessed">Not Assessed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select onValueChange={(value) => {
                                      const current = objectives[restaurant.id] || {};
                                      setUcoObjective(restaurant.id, current.uco_objective, current.uco_status, value);
                                    }}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="skip">Skip</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {(visitType === 'combined' || visitType === 'gas_focused') && (
                              <div>
                                <label className="text-sm font-medium text-orange-600">
                                  🔥 Gas Objective:
                                </label>
                                <Select onValueChange={(value) => setGasObjective(restaurant.id, value)}>
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
