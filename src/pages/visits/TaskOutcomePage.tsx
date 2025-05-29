
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, User, Phone } from 'lucide-react';
import TaskOutcomeForm from '@/components/visits/TaskOutcomeForm';

const TaskOutcomePage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, recordTaskOutcome } = useVisitTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  useEffect(() => {
    if (!taskId) {
      navigate('/visits');
    }
  }, [taskId, navigate]);

  const handleBack = () => {
    if (task?.plan_id) {
      navigate(`/visits/plans/${task.plan_id}`);
    } else {
      navigate('/visits');
    }
  };

  const handleSubmitOutcome = async (outcomeData: any) => {
    if (!taskId) return;
    
    setIsSubmitting(true);
    try {
      await recordTaskOutcome(taskId, outcomeData);
      handleBack();
    } catch (error) {
      console.error('Error recording outcome:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Task not found</p>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Record Visit Outcome</h1>
              <p className="text-muted-foreground">
                Record the outcome of your visit to {task.restaurant?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Restaurant</h4>
                <p className="text-lg font-semibold">{task.restaurant?.name}</p>
                {task.restaurant?.address && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {task.restaurant.address}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                {task.restaurant?.contact_person && (
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 mr-2" />
                    {task.restaurant.contact_person}
                  </div>
                )}
                {task.restaurant?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {task.restaurant.phone}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Visit Status</h4>
                <div className="space-y-1">
                  <p>Status: <span className="font-medium">{task.status}</span></p>
                  {task.priority_level && (
                    <p>Priority: <span className="font-medium">{task.priority_level}</span></p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outcome Form */}
        <TaskOutcomeForm
          task={task}
          onSubmit={handleSubmitOutcome}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
};

export default TaskOutcomePage;
