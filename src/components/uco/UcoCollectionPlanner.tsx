
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Truck, MapPin, Calendar, Users, Upload, Download, Route, Smartphone } from 'lucide-react';
import { useUcoPlans } from '@/hooks/useUcoPlans';
import { useUcoItems } from '@/hooks/useUcoItems';
import { useTownshipAnalytics, useRestaurantsByTownship } from '@/hooks/useTownshipAnalytics';
import { useGoogleSheetsIntegration } from '@/hooks/useGoogleSheetsIntegration';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UcoStatusBadge } from './UcoStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { GoogleSheetsImporter } from './GoogleSheetsImporter';
import { MobileStatusUpdater } from './MobileStatusUpdater';
import { UcoRouteOptimizer } from './UcoRouteOptimizer';
import { UcoTownshipMultiSelector } from './UcoTownshipMultiSelector';

export const UcoCollectionPlanner: React.FC = () => {
  const { profile } = useAuth();
  const { plans, createPlan } = useUcoPlans();
  const { analytics } = useTownshipAnalytics();
  const { exportToGoogleSheets } = useGoogleSheetsIntegration();
  const [selectedTownship, setSelectedTownship] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    plan_name: '',
    townships: [] as string[],
    plan_date: new Date().toISOString().split('T')[0],
    driver_name: '',
    truck_capacity_kg: 500,
  });

  const { restaurants } = useRestaurantsByTownship(selectedTownship);
  const { items: collectionItems } = useUcoItems(selectedPlanId);

  const handleCreatePlan = async () => {
    if (!profile?.id) {
      toast.error('You must be logged in to create plans');
      return;
    }

    if (!newPlan.plan_name || newPlan.townships.length === 0) {
      toast.error('Please fill in plan name and select at least one township');
      return;
    }

    try {
      await createPlan.mutateAsync({
        ...newPlan,
        created_by: profile.id,
      });
      
      setNewPlan({
        plan_name: '',
        townships: [],
        plan_date: new Date().toISOString().split('T')[0],
        driver_name: '',
        truck_capacity_kg: 500,
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleExportPlan = async (planId: string) => {
    try {
      await exportToGoogleSheets.mutateAsync(planId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span>Enhanced UCO Collection Planning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create-plan">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="create-plan">Create Plan</TabsTrigger>
              <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
              <TabsTrigger value="mobile-updates">Mobile Updates</TabsTrigger>
              <TabsTrigger value="route-optimizer">Route Optimizer</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create-plan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    value={newPlan.plan_name}
                    onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
                    placeholder="e.g., Multi-Township UCO Collection"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Plan Date</label>
                  <Input
                    type="date"
                    value={newPlan.plan_date}
                    onChange={(e) => setNewPlan({ ...newPlan, plan_date: e.target.value })}
                  />
                </div>
              </div>

              <UcoTownshipMultiSelector
                selectedTownships={newPlan.townships}
                onChange={(townships) => setNewPlan({ ...newPlan, townships })}
                placeholder="Select townships for collection"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => setNewPlan({ ...newPlan, truck_capacity_kg: parseInt(e.target.value) || 500 })}
                    placeholder="500"
                  />
                </div>
              </div>
              
              <Button onClick={handleCreatePlan} className="w-full" disabled={newPlan.townships.length === 0}>
                Create UCO Collection Plan
              </Button>
            </TabsContent>

            <TabsContent value="google-sheets" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GoogleSheetsImporter 
                  onImportComplete={(planId) => {
                    setSelectedPlanId(planId);
                    toast.success('Plan imported! Check the Route Optimizer tab.');
                  }}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5 text-green-600" />
                      <span>Export to Google Sheets</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Plan to Export</label>
                      <Select onValueChange={setSelectedPlanId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans?.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.plan_name} - {plan.townships.join(', ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={() => selectedPlanId && handleExportPlan(selectedPlanId)}
                      disabled={!selectedPlanId}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Exports current plan data including status updates and collection details</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mobile-updates" className="space-y-4">
              <div className="grid gap-4">
                {collectionItems?.length > 0 ? (
                  collectionItems.map((item) => (
                    <MobileStatusUpdater 
                      key={item.id} 
                      item={item as any}
                      onUpdate={() => toast.success('Status updated successfully')}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No Collection Items</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a plan or import from Google Sheets to see mobile update interface
                      </p>
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                        Import Plan
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="route-optimizer" className="space-y-4">
              {collectionItems?.length > 0 ? (
                <UcoRouteOptimizer 
                  stops={collectionItems as any}
                  onOptimize={(optimizedStops) => {
                    toast.success('Route optimized! Open in Google Maps to navigate.');
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Route to Optimize</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a collection plan to optimize the route
                    </p>
                    <Select onValueChange={setSelectedPlanId}>
                      <SelectTrigger className="max-w-sm mx-auto">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.plan_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
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
                      {plan.townships.join(', ')}
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
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    Select
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportPlan(plan.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
