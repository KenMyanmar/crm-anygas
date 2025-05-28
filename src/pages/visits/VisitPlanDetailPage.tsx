
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Clock, 
  Phone, 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisitTask } from '@/types/visits';

const VisitPlanDetailPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans } = useVisitPlans();
  const { tasks, createVisitTask, updateVisitTask } = useVisitTasks(planId);
  const { restaurants } = useRestaurants();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    restaurant_id: '',
    visit_time: '',
    notes: ''
  });

  const currentPlan = plans.find(plan => plan.id === planId);

  const handleAddTask = async () => {
    try {
      if (!planId || !profile?.id) return;

      await createVisitTask({
        plan_id: planId,
        restaurant_id: taskFormData.restaurant_id,
        salesperson_uid: profile.id,
        status: 'PLANNED',
        visit_time: taskFormData.visit_time,
        notes: taskFormData.notes
      });

      setIsAddTaskDialogOpen(false);
      setTaskFormData({ restaurant_id: '', visit_time: '', notes: '' });
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

  const getStatusIcon = (status: VisitTask['status']) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="h-4 w-4" />;
      case 'VISITED':
        return <CheckCircle className="h-4 w-4" />;
      case 'RESCHEDULED':
        return <AlertCircle className="h-4 w-4" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: VisitTask['status']) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'VISITED':
        return 'bg-green-100 text-green-800';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Visit Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Visit Task</DialogTitle>
                <DialogDescription>
                  Add a restaurant visit to this plan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Select 
                    value={taskFormData.restaurant_id} 
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, restaurant_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name} {restaurant.township && `- ${restaurant.township}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="visit_time">Visit Time</Label>
                  <Input
                    id="visit_time"
                    type="datetime-local"
                    value={taskFormData.visit_time}
                    onChange={(e) => setTaskFormData({ ...taskFormData, visit_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={taskFormData.notes}
                    onChange={(e) => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                    placeholder="Visit objectives, special notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTask}
                  disabled={!taskFormData.restaurant_id}
                >
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Visit Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No visit tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add restaurants to visit for this plan.
                </p>
                <Button onClick={() => setIsAddTaskDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{task.restaurant?.name}</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusIcon(task.status)}
                              <span className="ml-1">{task.status}</span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {task.restaurant?.township && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {task.restaurant.township}
                              </div>
                            )}
                            {task.restaurant?.contact_person && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {task.restaurant.contact_person}
                              </div>
                            )}
                            {task.restaurant?.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {task.restaurant.phone}
                              </div>
                            )}
                            {task.visit_time && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(new Date(task.visit_time), 'MMM dd, h:mm a')}
                              </div>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{task.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Select
                            value={task.status}
                            onValueChange={(value: VisitTask['status']) => handleStatusChange(task.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLANNED">Planned</SelectItem>
                              <SelectItem value="VISITED">Visited</SelectItem>
                              <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                              <SelectItem value="CANCELED">Canceled</SelectItem>
                            </SelectContent>
                          </Select>
                          {task.status === 'VISITED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/visits/tasks/${task.id}/outcome`)}
                            >
                              Record Outcome
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VisitPlanDetailPage;
