
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface FollowUpTaskData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  assignedToUserId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  restaurantId: string;
}

export const useFollowUpTaskManager = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const createFollowUpTask = useMutation({
    mutationFn: async (taskData: FollowUpTaskData) => {
      if (!profile?.id) {
        throw new Error('User must be authenticated');
      }

      // Combine date and time for due_date
      const dueDatetime = new Date(`${taskData.dueDate}T${taskData.dueTime}`);
      
      // Create the enhanced task
      const { data: task, error: taskError } = await supabase
        .from('enhanced_tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          task_type: 'lead_followup',
          status: 'pending',
          priority: taskData.priority,
          due_date: dueDatetime.toISOString(),
          estimated_duration_minutes: 30,
          created_by_user_id: profile.id,
          assigned_to_user_id: taskData.assignedToUserId,
          restaurant_id: taskData.restaurantId,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create corresponding calendar event
      const { error: calendarError } = await supabase
        .from('calendar_events')
        .insert({
          title: `Follow-up: ${taskData.title}`,
          description: taskData.description,
          event_type: 'task',
          start_datetime: dueDatetime.toISOString(),
          end_datetime: new Date(dueDatetime.getTime() + 30 * 60000).toISOString(), // 30 minutes later
          created_by_user_id: profile.id,
          assigned_to_user_id: taskData.assignedToUserId,
          restaurant_id: taskData.restaurantId,
          status: 'scheduled',
          priority: taskData.priority,
        });

      if (calendarError) {
        console.warn('Failed to create calendar event:', calendarError);
        // Don't throw - task creation is more important than calendar event
      }

      // Create notification for 1 hour before
      const notificationTime = new Date(dueDatetime.getTime() - 60 * 60000); // 1 hour before
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: taskData.assignedToUserId,
          title: 'Follow-up Reminder',
          message: `Follow-up task "${taskData.title}" is due in 1 hour`,
          link: `/restaurants/${taskData.restaurantId}`,
        });

      if (notificationError) {
        console.warn('Failed to create notification:', notificationError);
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Follow-up task created successfully');
    },
    onError: (error) => {
      console.error('Failed to create follow-up task:', error);
      toast.error('Failed to create follow-up task');
    },
  });

  const completeFollowUpTask = useMutation({
    mutationFn: async ({ taskId, completionNotes }: { taskId: string; completionNotes?: string }) => {
      if (!profile?.id) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('enhanced_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Mark any escalations as resolved
      const { error: escalationError } = await supabase
        .from('follow_up_escalations')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by_user_id: profile.id,
        })
        .eq('task_id', taskId)
        .is('resolved_at', null);

      if (escalationError) {
        console.warn('Failed to resolve escalations:', escalationError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks'] });
      toast.success('Follow-up task completed successfully');
    },
    onError: (error) => {
      console.error('Failed to complete follow-up task:', error);
      toast.error('Failed to complete follow-up task');
    },
  });

  return {
    createFollowUpTask,
    completeFollowUpTask,
  };
};
