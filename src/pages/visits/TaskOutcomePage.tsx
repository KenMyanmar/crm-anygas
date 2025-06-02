import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useTaskOutcomes } from '@/hooks/useTaskOutcomes';
import TaskOutcomeForm from '@/components/visits/TaskOutcomeForm';
import VisitCommentsSection from '@/components/visits/VisitCommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitTask } from '@/types/visits';
import { ArrowLeft, MapPin, User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskOutcomePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<VisitTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recordTaskOutcome, isSubmitting } = useTaskOutcomes();
  
  // React Strict Mode guard
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double mounting in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('TaskOutcomePage mounted with id:', id);
    if (id) {
      fetchTask();
    } else {
      console.error('No id provided');
      setError('No task ID provided');
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      hasInitialized.current = false;
    };
  }, [id]);

  const fetchTask = async () => {
    if (!id) {
      console.error('fetchTask called without id');
      setError('No task ID provided');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching task with ID:', id);
      setIsLoading(true);
      setError(null);

      // First try the detailed view
      const { data: detailedData, error: detailedError } = await supabase
        .from('visit_tasks_detailed')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      console.log('Detailed view query result:', { detailedData, detailedError });

      if (detailedError) {
        console.error('Error from detailed view:', detailedError);
        
        // Fallback to basic visit_tasks table with join
        console.log('Falling back to basic visit_tasks table');
        const { data: basicData, error: basicError } = await supabase
          .from('visit_tasks')
          .select(`
            *,
            restaurant:restaurants(
              id,
              name,
              township,
              address,
              contact_person,
              phone
            )
          `)
          .eq('id', id)
          .maybeSingle();

        console.log('Basic query result:', { basicData, basicError });

        if (basicError) {
          console.error('Error from basic query:', basicError);
          throw new Error(`Failed to fetch task: ${basicError.message}`);
        }

        if (!basicData) {
          console.error('Task not found in basic query');
          throw new Error('Task not found');
        }

        setTask(basicData);
      } else {
        if (!detailedData) {
          console.error('Task not found in detailed view');
          throw new Error('Task not found');
        }
        
        // Transform detailed view data to match VisitTask interface
        const transformedTask = {
          id: detailedData.id,
          plan_id: detailedData.plan_id,
          restaurant_id: detailedData.restaurant_id,
          salesperson_uid: detailedData.salesperson_uid,
          status: detailedData.status,
          visit_time: detailedData.visit_time,
          notes: detailedData.notes,
          visit_sequence: detailedData.visit_sequence,
          estimated_duration_minutes: detailedData.estimated_duration_minutes,
          priority_level: detailedData.priority_level,
          created_at: detailedData.created_at,
          updated_at: detailedData.updated_at,
          restaurant: {
            id: detailedData.restaurant_id,
            name: detailedData.restaurant_name,
            township: detailedData.township,
            contact_person: detailedData.contact_person,
            phone: detailedData.phone,
            address: detailedData.address
          }
        };
        
        console.log('Transformed task data:', transformedTask);
        setTask(transformedTask);
      }
    } catch (error: any) {
      console.error('Error in fetchTask:', error);
      const errorMessage = error.message || 'Failed to load visit task';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOutcome = async (outcomeData: any) => {
    if (!id) return;
    
    const result = await recordTaskOutcome(id, outcomeData);
    
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading task details...</p>
            <p className="text-sm text-gray-500 mt-2">Task ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Task</h3>
          <p className="text-muted-foreground mb-4">{error || 'Task not found'}</p>
          <p className="text-sm text-gray-500 mb-4">Task ID: {id}</p>
          <div className="space-x-2">
            <Button onClick={() => navigate('/visits')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Visits
            </Button>
            <Button variant="outline" onClick={fetchTask}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Visit Outcome</h1>
          <p className="text-muted-foreground">Record the outcome of your visit and update lead status</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/visits')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Visits
        </Button>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Task Details (4fr on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{task.restaurant?.name || 'Unknown Restaurant'}</h3>
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
          <VisitCommentsSection visitTaskId={id!} />
        </div>

        {/* Right Column - Outcome Form (8fr on desktop) */}
        <div className="lg:col-span-8">
          <TaskOutcomeForm
            task={task}
            onSubmit={handleSubmitOutcome}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskOutcomePage;
