
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import BulkRestaurantSelector from '@/components/visits/BulkRestaurantSelector';
import VisitTasksTable from '@/components/visits/VisitTasksTable';
import VisitPlanMapPreview from '@/components/visits/VisitPlanMapPreview';
import VisitPlanHeader from '@/components/visits/VisitPlanHeader';
import VisitPlanStats from '@/components/visits/VisitPlanStats';
import VisitPlanStatusSummary from '@/components/visits/VisitPlanStatusSummary';
import VisitPlanNotes from '@/components/visits/VisitPlanNotes';
import EmptyVisitPlan from '@/components/visits/EmptyVisitPlan';
import { VisitTask } from '@/types/visits';
import { ArrowLeft, Info, Users } from 'lucide-react';

const VisitPlanDetailPage = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, updateVisitPlan } = useVisitPlans();
  const { tasks, createVisitTask, updateVisitTask } = useVisitTasks(planId);
  
  const [isAddRestaurantsDialogOpen, setIsAddRestaurantsDialogOpen] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  const currentPlan = plans.find(plan => plan.id === planId);
  const isMyPlan = currentPlan && currentPlan.created_by === profile?.id;

  // Debug logging
  useEffect(() => {
    console.log('VisitPlanDetailPage loaded');
    console.log('Plan ID from params:', planId);
    console.log('Current plan:', currentPlan);
    console.log('Tasks:', tasks);
    console.log('Is my plan:', isMyPlan);
  }, [planId, currentPlan, tasks, isMyPlan]);

  // Show bulk selector dialog immediately if plan has no restaurants and user owns the plan
  useEffect(() => {
    if (currentPlan && tasks.length === 0 && isMyPlan) {
      // Small timeout to ensure UI is rendered first
      const timer = setTimeout(() => {
        setIsAddRestaurantsDialogOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlan, tasks.length, isMyPlan]);

  const handleBulkAddRestaurants = async () => {
    try {
      if (!planId || !profile?.id) return;

      // Add all selected restaurants as visit tasks
      const promises = selectedRestaurants.map((restaurantId, index) => 
        createVisitTask({
          plan_id: planId,
          restaurant_id: restaurantId,
          salesperson_uid: profile.id,
          status: 'PLANNED',
          visit_sequence: tasks.length + index + 1,
          estimated_duration_minutes: 60,
          priority_level: 'MEDIUM'
        })
      );

      await Promise.all(promises);
      
      // Update plan with estimated total duration
      const totalEstimatedDuration = (tasks.length + selectedRestaurants.length) * 60;
      await updateVisitPlan(planId, {
        estimated_total_duration_minutes: totalEstimatedDuration
      });

      setIsAddRestaurantsDialogOpen(false);
      setSelectedRestaurants([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: VisitTask['status']) => {
    try {
      await updateVisitTask(taskId, { status: newStatus });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePriorityChange = async (taskId: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    try {
      await updateVisitTask(taskId, { priority_level: priority });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRecordOutcome = (taskId: string) => {
    navigate(`/visits/tasks/${taskId}/outcome`);
  };

  const handleBack = () => {
    navigate('/visits');
  };

  const handleAddRestaurants = () => {
    setIsAddRestaurantsDialogOpen(true);
  };

  if (!currentPlan) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Visit plan not found</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit Planner
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <VisitPlanHeader
          plan={currentPlan}
          onBack={handleBack}
          onAddRestaurants={handleAddRestaurants}
        />

        {/* Collaboration Info */}
        {!isMyPlan && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  <strong>Viewing {currentPlan.creator?.full_name || 'team member'}'s plan.</strong> 
                  You can view all details and add comments. 
                  {currentPlan.creator?.full_name && ` Contact ${currentPlan.creator.full_name} to modify restaurants or settings.`}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <VisitPlanStats tasks={tasks} />

        {/* Map Preview - Show only when there are tasks */}
        {tasks.length > 0 && (
          <VisitPlanMapPreview tasks={tasks} />
        )}

        <VisitPlanStatusSummary tasks={tasks} />

        <VisitPlanNotes remarks={currentPlan.remarks} />

        {/* Visit Tasks Table or Empty State */}
        {tasks.length === 0 ? (
          <EmptyVisitPlan onAddRestaurants={isMyPlan ? handleAddRestaurants : undefined} />
        ) : (
          <VisitTasksTable
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onRecordOutcome={handleRecordOutcome}
            planCreatedBy={currentPlan.created_by}
          />
        )}

        {/* Bulk Restaurant Selector Dialog - Only show if user owns the plan */}
        {isMyPlan && (
          <Dialog 
            open={isAddRestaurantsDialogOpen} 
            onOpenChange={setIsAddRestaurantsDialogOpen}
          >
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
              <BulkRestaurantSelector
                selectedRestaurants={selectedRestaurants}
                onSelectionChange={setSelectedRestaurants}
                onConfirm={handleBulkAddRestaurants}
                onCancel={() => {
                  setIsAddRestaurantsDialogOpen(false);
                  setSelectedRestaurants([]);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VisitPlanDetailPage;
