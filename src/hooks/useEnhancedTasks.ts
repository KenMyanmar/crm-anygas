
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EnhancedTask } from '@/types/calendar';
import { toast } from 'sonner';

export const useEnhancedTasks = (filters?: {
  status?: string[];
  assignedTo?: string;
  taskType?: string[];
  dueDate?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['enhanced-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('enhanced_tasks')
        .select(`
          *,
          assigned_user:users!enhanced_tasks_assigned_to_user_id_fkey(full_name),
          created_by_user:users!enhanced_tasks_created_by_user_id_fkey(full_name),
          restaurant:restaurants(name, township),
          lead:leads(name),
          order:orders(order_number),
          parent_task:enhanced_tasks!enhanced_tasks_parent_task_id_fkey(title)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to_user_id', filters.assignedTo);
      }
      if (filters?.taskType?.length) {
        query = query.in('task_type', filters.taskType);
      }
      if (filters?.dueDate) {
        query = query.lte('due_date', filters.dueDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching enhanced tasks:', error);
        throw error;
      }
      
      return data as EnhancedTask[];
    },
    staleTime: 30000,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: Omit<EnhancedTask, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('enhanced_tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnhancedTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('enhanced_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({ id, completionNotes }: { id: string; completionNotes?: string }) => {
      const { data, error } = await supabase
        .from('enhanced_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      toast.success('Task completed successfully');
    },
    onError: (error) => {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('enhanced_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
};
