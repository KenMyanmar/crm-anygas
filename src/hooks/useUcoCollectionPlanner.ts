
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUcoPlans } from '@/hooks/useUcoPlans';
import { useTownshipAnalytics, useRestaurantsByTownship } from '@/hooks/useTownshipAnalytics';
import { useGoogleSheetsIntegration } from '@/hooks/useGoogleSheetsIntegration';
import { useUcoItems } from '@/hooks/useUcoItems';
import { toast } from 'sonner';

interface NewPlanState {
  plan_name: string;
  townships: string[];
  plan_date: string;
  driver_name: string;
  truck_capacity_kg: number;
}

export const useUcoCollectionPlanner = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, createPlan } = useUcoPlans();
  const { analytics } = useTownshipAnalytics();
  const { exportToGoogleSheets } = useGoogleSheetsIntegration();
  
  const [selectedTownship, setSelectedTownship] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<NewPlanState>({
    plan_name: '',
    townships: [],
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

  const handleSelectPlan = (planId: string) => {
    navigate(`/uco/plans/${planId}`);
  };

  const handleExportPlan = async (planId: string) => {
    try {
      await exportToGoogleSheets.mutateAsync(planId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return {
    // State
    selectedTownship,
    selectedPlanId,
    isImportDialogOpen,
    newPlan,
    
    // Data
    plans,
    analytics,
    restaurants,
    collectionItems,
    
    // Actions
    setSelectedTownship,
    setSelectedPlanId,
    setIsImportDialogOpen,
    setNewPlan,
    handleCreatePlan,
    handleSelectPlan,
    handleExportPlan,
    
    // Loading states
    isCreating: createPlan.isPending,
  };
};
