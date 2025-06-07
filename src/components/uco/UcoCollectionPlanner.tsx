
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, Calendar, Users, Upload } from 'lucide-react';
import { useUcoCollectionPlans, useUcoCollectionItems } from '@/hooks/useUcoCollectionPlans';
import { useTownshipAnalytics, useRestaurantsByTownship } from '@/hooks/useTownshipAnalytics';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UcoStatusBadge } from './UcoStatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const UcoCollectionPlanner: React.FC = () => {
  const { profile } = useAuth();
  const { plans, createPlan } = useUcoCollectionPlans();
  const { analytics } = useTownshipAnalytics();
  const [selectedTownship, setSelectedTownship] = useState<string>('');
  const [newPlan, setNewPlan] = useState({
    plan_name: '',
    township: '',
    plan_date: new Date().toISOString().split('T')[0],
    driver_name: '',
    truck_capacity_kg: 500,
  });

  const { restaurants } = useRestaurantsByTownship(selectedTownship);

  const handleCreatePlan = async () => {
    if (!profile?.id) {
      toast.error('You must be logged in to create plans');
      return;
    }

    if (!newPlan.plan_name || !newPlan.township) {
      toast.error('Please fill in plan name and township');
      return;
    }

    try {
      await createPlan.mutateAsync({
        ...newPlan,
        created_by: profile.id,
      });
      
      setNewPlan({
        plan_name: '',
        township: '',
        plan_date: new Date().toISOString().split('T')[0],
        driver_name: '',
        truck_capacity_kg: 500,
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span>UCO Collection Planning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create-plan">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create-plan">Create Plan</TabsTrigger>
              <TabsTrigger value="township-analytics">Township Analytics</TabsTrigger>
              <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="create-plan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    value={newPlan.plan_name}
                    onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
                    placeholder="e.g., Yankin Township UCO Collection"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Township</label>
                  <Select
                    value={newPlan.township}
                    onValueChange={(value) => setNewPlan({ ...newPlan, township: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select township" />
                    </SelectTrigger>
                    <SelectContent>
                      {analytics?.map((item) => (
                        <SelectItem key={item.township} value={item.township}>
                          {item.township} ({item.total_restaurants} restaurants)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Plan Date</label>
                  <Input
                    type="date"
                    value={newPlan.plan_date}
                    onChange={(e) => setNewPlan({ ...newPlan, plan_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Driver Name</label>
                  <Input
                    value={newPlan.driver_name}
                    onChange={(e) => setNewPlan({ ...newPlan, driver_name: e.target.value })}
                    placeholder="Enter driver name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Truck Capacity (kg)</label>
                  <Input
                    type="number"
                    value={newPlan.truck_capacity_kg}
                    onChange={(e) => setNewPlan({ ...newPlan, truck_capacity_kg: Number(e.target.value) })}
                  />
                </div>
              </div>
              
              <Button onClick={handleCreatePlan} className="w-full">
                Create UCO Collection Plan
              </Button>
            </TabsContent>

            <TabsContent value="township-analytics" className="space-y-4">
              <div className="grid gap-4">
                {analytics?.map((item) => (
                  <Card key={item.township}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {item.township}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Total: {item.total_restaurants} restaurants</span>
                            <span>Active: {item.active_suppliers} suppliers</span>
                            <span>Collected: {item.total_collected_last_30_days?.toFixed(1) || 0}kg (30d)</span>
                            <span>Visits: {item.visits_last_30_days} (30d)</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTownship(item.township)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bulk-import" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Import UCO Collection Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload your spreadsheet with restaurant data, UCO status, and priorities
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Supported formats: Excel (.xlsx), CSV (.csv)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Required columns: Restaurant Name, Township, UCO Status, Priority
                      </p>
                    </div>
                    <Button className="w-full">
                      Choose File to Import
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent UCO Collection Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plans?.slice(0, 5).map((plan) => (
              <div key={plan.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{plan.plan_name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {plan.township}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(plan.plan_date).toLocaleDateString()}
                    </span>
                    {plan.driver_name && (
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {plan.driver_name}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
