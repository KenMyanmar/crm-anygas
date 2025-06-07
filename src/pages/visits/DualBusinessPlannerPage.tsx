
import React, { useState } from 'react';
import { EnhancedDualBusinessVisitPlanner } from '@/components/visits/EnhancedDualBusinessVisitPlanner';
import { DualBusinessDashboard } from '@/components/dashboard/DualBusinessDashboard';
import { UcoCollectionPlanner } from '@/components/uco/UcoCollectionPlanner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const DualBusinessPlannerPage = () => {
  const [activeTab, setActiveTab] = useState('planner');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['dual-business-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dual_business_restaurant_view')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateVisitPlan = async (planData: any) => {
    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create visit plans');
        return;
      }

      // Create visit plan in visit_plans table
      const { data: plan, error: planError } = await supabase
        .from('visit_plans')
        .insert({
          title: `${planData.visit_type} visit plan`,
          plan_date: new Date().toISOString().split('T')[0],
          estimated_total_duration_minutes: planData.estimated_duration,
          created_by: user.id,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create visit tasks for each restaurant
      const tasks = planData.restaurants.map((restaurant: any, index: number) => ({
        plan_id: plan.id,
        restaurant_id: restaurant.restaurant_id,
        salesperson_uid: user.id,
        visit_sequence: index + 1,
        estimated_duration_minutes: planData.visit_type === 'combined' ? 45 : 30,
        notes: JSON.stringify(restaurant.objectives),
      }));

      const { error: tasksError } = await supabase
        .from('visit_tasks')
        .insert(tasks);

      if (tasksError) throw tasksError;

      toast.success(`Visit plan created with ${planData.restaurants.length} restaurants`);
      
      // Navigate to the visit plan detail page
      window.location.href = `/visits/plan/${plan.id}`;
      
    } catch (error: any) {
      console.error('Error creating visit plan:', error);
      toast.error('Failed to create visit plan');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading restaurants...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planner">Visit Planner</TabsTrigger>
          <TabsTrigger value="uco-planning">UCO Planning</TabsTrigger>
          <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Township Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="planner" className="mt-6">
          <EnhancedDualBusinessVisitPlanner
            restaurants={restaurants || []}
            onCreateVisitPlan={handleCreateVisitPlan}
          />
        </TabsContent>
        
        <TabsContent value="uco-planning" className="mt-6">
          <UcoCollectionPlanner />
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-6">
          <DualBusinessDashboard />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          {/* Township analytics will be implemented here */}
          <div className="text-center py-8 text-muted-foreground">
            Township analytics coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DualBusinessPlannerPage;
