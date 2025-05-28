
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { VisitTask, TaskOutcome } from '@/types/visits';

export const useVisitTasks = (planId?: string) => {
  const [tasks, setTasks] = useState<VisitTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVisitTasks = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('visit_tasks')
        .select(`
          *,
          restaurant:restaurants (
            id,
            name,
            township,
            contact_person,
            phone
          )
        `);

      if (planId) {
        query = query.eq('plan_id', planId);
      }

      const { data, error } = await query
        .order('visit_time', { ascending: true });

      if (error) throw error;

      const transformedData = (data || []).map((task: any) => ({
        ...task,
        restaurant: Array.isArray(task.restaurant) ? task.restaurant[0] : task.restaurant
      }));

      setTasks(transformedData);
    } catch (error) {
      console.error('Error fetching visit tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load visit tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createVisitTask = async (taskData: Omit<VisitTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('visit_tasks')
        .insert(taskData)
        .select(`
          *,
          restaurant:restaurants (
            id,
            name,
            township,
            contact_person,
            phone
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        restaurant: Array.isArray(data.restaurant) ? data.restaurant[0] : data.restaurant
      };

      setTasks(prev => [...prev, transformedData]);
      toast({
        title: "Success",
        description: "Visit task created successfully",
      });

      return transformedData;
    } catch (error) {
      console.error('Error creating visit task:', error);
      toast({
        title: "Error",
        description: "Failed to create visit task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVisitTask = async (id: string, updates: Partial<VisitTask>) => {
    try {
      const { data, error } = await supabase
        .from('visit_tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          restaurant:restaurants (
            id,
            name,
            township,
            contact_person,
            phone
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        restaurant: Array.isArray(data.restaurant) ? data.restaurant[0] : data.restaurant
      };

      setTasks(prev => prev.map(task => 
        task.id === id ? transformedData : task
      ));

      toast({
        title: "Success",
        description: "Visit task updated successfully",
      });

      return transformedData;
    } catch (error) {
      console.error('Error updating visit task:', error);
      toast({
        title: "Error",
        description: "Failed to update visit task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const recordTaskOutcome = async (taskId: string, outcomeData: Omit<TaskOutcome, 'id' | 'task_id' | 'created_by' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('task_outcomes')
        .insert({
          ...outcomeData,
          task_id: taskId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update the task status to VISITED
      await updateVisitTask(taskId, { status: 'VISITED' });

      toast({
        title: "Success",
        description: "Task outcome recorded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error recording task outcome:', error);
      toast({
        title: "Error",
        description: "Failed to record task outcome",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVisitTasks();
  }, [planId]);

  return {
    tasks,
    isLoading,
    createVisitTask,
    updateVisitTask,
    recordTaskOutcome,
    refetch: fetchVisitTasks
  };
};
