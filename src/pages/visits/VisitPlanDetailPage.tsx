import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Calendar,
  Clock,
  Users,
  MapPin,
  ListFilter
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BulkRestaurantSelector from '@/components/visits/BulkRestaurantSelector';
import VisitTasksTable from '@/components/visits/VisitTasksTable';
import { VisitTask } from '@/types/visits';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const VisitPlanDetailPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, updateVisitPlan } = useVisitPlans();
  const { tasks, createVisitTask, updateVisitTask } = useVisitTasks(planId);
  
  const [isAddRestaurantsDialogOpen, setIsAddRestaurantsDialogOpen] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  const currentPlan = plans.find(plan => plan.id === planId);

  // Show bulk selector dialog immediately if plan has no restaurants
  useEffect(() => {
    if (currentPlan && tasks.length === 0) {
      // Small timeout to ensure UI is rendered first
      const timer = setTimeout(() => {
        setIsAddRestaurantsDialogOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlan, tasks.length]);

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

  // Calculate plan statistics
  const planStats = {
    totalTasks: tasks.length,
    planned: tasks.filter(t => t.status === 'PLANNED').length,
    visited: tasks.filter(t => t.status === 'VISITED').length,
    rescheduled: tasks.filter(t => t.status === 'RESCHEDULED').length,
    canceled: tasks.filter(t => t.status === 'CANCELED').length,
    estimatedDuration: tasks.reduce((sum, t) => sum + (t.estimated_duration_minutes || 60), 0),
    townships: [...new Set(tasks.map(t => t.restaurant?.township).filter(Boolean))].length
  };

  if (!currentPlan) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Visit plan not found</p>
          <Button onClick={() => navigate('/visits')} className="mt-4">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/visits')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{currentPlan.title}</h1>
              <p className="text-muted-foreground">
                {format(new Date(currentPlan.plan_date), 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentPlan.team_visible && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Users className="h-4 w-4 mr-1" />
                Team Visible
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setIsAddRestaurantsDialogOpen(true)}
                    className="relative"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurants
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-pulse">
                      <ListFilter className="h-3 w-3" />
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add multiple restaurants with advanced filtering options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                  <p className="text-2xl font-bold">{planStats.totalTasks}</p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Townships</p>
                  <p className="text-2xl font-bold">{planStats.townships}</p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                  <p className="text-2xl font-bold">{Math.round(planStats.estimatedDuration / 60)}h</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{planStats.visited}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {planStats.totalTasks > 0 ? Math.round((planStats.visited / planStats.totalTasks) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Planned: {planStats.planned}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Visited: {planStats.visited}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Rescheduled: {planStats.rescheduled}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Canceled: {planStats.canceled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentPlan.remarks && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{currentPlan.remarks}</p>
            </CardContent>
          </Card>
        )}

        {/* Visit Tasks Table */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No restaurants added yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding restaurants to visit for this plan.
              </p>
              <Button 
                onClick={() => setIsAddRestaurantsDialogOpen(true)}
                className="animate-pulse"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurants
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Our bulk restaurant selector allows you to add multiple restaurants at once,
                with filtering by township and lead status.
              </p>
            </CardContent>
          </Card>
        ) : (
          <VisitTasksTable
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onRecordOutcome={handleRecordOutcome}
          />
        )}

        {/* Bulk Restaurant Selector Dialog */}
        <Dialog 
          open={isAddRestaurantsDialogOpen} 
          onOpenChange={setIsAddRestaurantsDialogOpen}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Bulk Restaurant Selector</DialogTitle>
              <DialogDescription>
                Select multiple restaurants at once with advanced filtering options.
                You can filter by township, lead status, and search by name or contact person.
              </DialogDescription>
            </DialogHeader>
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
      </div>
    </DashboardLayout>
  );
};

export default VisitPlanDetailPage;
