
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck } from 'lucide-react';
import { useUcoCollectionPlanner } from '@/hooks/useUcoCollectionPlanner';
import { CreatePlanTab } from './planner/CreatePlanTab';
import { GoogleSheetsTab } from './planner/GoogleSheetsTab';
import { MobileUpdatesTab } from './planner/MobileUpdatesTab';
import { RouteOptimizerTab } from './planner/RouteOptimizerTab';
import { AnalyticsTab } from './planner/AnalyticsTab';
import { RecentPlans } from './planner/RecentPlans';

export const UcoCollectionPlanner: React.FC = () => {
  const {
    selectedTownship,
    selectedPlanId,
    isImportDialogOpen,
    newPlan,
    plans,
    analytics,
    restaurants,
    collectionItems,
    setSelectedTownship,
    setSelectedPlanId,
    setIsImportDialogOpen,
    setNewPlan,
    handleCreatePlan,
    handleSelectPlan,
    handleExportPlan,
    isCreating,
  } = useUcoCollectionPlanner();

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

            <TabsContent value="create-plan">
              <CreatePlanTab
                newPlan={newPlan}
                setNewPlan={setNewPlan}
                onCreatePlan={handleCreatePlan}
                isCreating={isCreating}
              />
            </TabsContent>

            <TabsContent value="google-sheets">
              <GoogleSheetsTab
                plans={plans}
                selectedPlanId={selectedPlanId}
                setSelectedPlanId={setSelectedPlanId}
                onExportPlan={handleExportPlan}
              />
            </TabsContent>

            <TabsContent value="mobile-updates">
              <MobileUpdatesTab
                collectionItems={collectionItems}
                onImportDialogOpen={() => setIsImportDialogOpen(true)}
              />
            </TabsContent>

            <TabsContent value="route-optimizer">
              <RouteOptimizerTab
                collectionItems={collectionItems}
                plans={plans}
                setSelectedPlanId={setSelectedPlanId}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab
                analytics={analytics}
                onTownshipSelect={setSelectedTownship}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RecentPlans
        plans={plans}
        onSelectPlan={handleSelectPlan}
        onExportPlan={handleExportPlan}
      />
    </div>
  );
};
