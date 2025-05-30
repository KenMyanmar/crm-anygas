
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useTaskOutcomes } from '@/hooks/useTaskOutcomes';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PageContainer from '@/components/layouts/PageContainer';
import TaskOutcomeForm from '@/components/visits/TaskOutcomeForm';
import VisitCommentsSection from '@/components/visits/VisitCommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitTask } from '@/types/visits';
import { ArrowLeft, MapPin, User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskOutcomePage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<VisitTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { recordTaskOutcome, isSubmitting } = useTaskOutcomes();

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_tasks_detailed')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        throw error;
      }

      setTask(data);
    } catch (error: any) {
      console.error('Error fetching task:', error);
      toast({
        title: "Error",
        description: "Failed to load visit task",
        variant: "destructive",
      });
      navigate('/visits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOutcome = async (outcomeData: any) => {
    if (!taskId) return;
    
    const result = await recordTaskOutcome(taskId, outcomeData);
    
    if (result.success) {
      // Navigate back to visit plan or visits page
      navigate('/visits', { 
        state: { 
          message: 'Visit outcome recorded successfully',
          orderId: result.orderId 
        }
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="text-center">
            <p className="text-muted-foreground">Task not found</p>
            <Button onClick={() => navigate('/visits')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Visits
            </Button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer
        title="Record Visit Outcome"
        description="Record the outcome of your visit and update lead status"
        action={
          <Button variant="outline" onClick={() => navigate('/visits')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visits
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{task.restaurant?.name}</h3>
                  {task.restaurant?.township && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {task.restaurant.township}
                    </div>
                  )}
                  {task.restaurant?.address && (
                    <p className="text-sm text-muted-foreground mt-1">{task.restaurant.address}</p>
                  )}
                </div>

                {task.restaurant?.contact_person && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2" />
                    {task.restaurant.contact_person}
                  </div>
                )}

                {task.restaurant?.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {task.restaurant.phone}
                  </div>
                )}

                {task.visit_time && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(task.visit_time).toLocaleString()}
                  </div>
                )}

                {task.notes && (
                  <div>
                    <p className="text-sm font-medium">Visit Notes:</p>
                    <p className="text-sm text-muted-foreground">{task.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <VisitCommentsSection visitTaskId={taskId!} />
          </div>

          {/* Right Column - Outcome Form */}
          <div className="lg:col-span-2">
            <TaskOutcomeForm
              task={task}
              onSubmit={handleSubmitOutcome}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default TaskOutcomePage;
