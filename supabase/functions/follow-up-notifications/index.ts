
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      enhanced_tasks: any;
      notifications: any;
      follow_up_escalations: any;
      users: any;
    };
    Functions: {
      check_overdue_tasks: {
        Args: Record<string, never>;
        Returns: {
          task_id: string;
          restaurant_name: string;
          assigned_user_name: string;
          due_date: string;
          hours_overdue: number;
        }[];
      };
      get_manager_user_ids: {
        Args: Record<string, never>;
        Returns: { user_id: string }[];
      };
    };
  };
}

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting follow-up notifications check...');

    // Check for overdue tasks that need escalation
    const { data: overdueTasks, error: overdueError } = await supabase
      .rpc('check_overdue_tasks');

    if (overdueError) {
      console.error('Error checking overdue tasks:', overdueError);
      throw overdueError;
    }

    console.log(`Found ${overdueTasks?.length || 0} overdue tasks`);

    if (overdueTasks && overdueTasks.length > 0) {
      // Get manager user IDs for escalation
      const { data: managers, error: managersError } = await supabase
        .rpc('get_manager_user_ids');

      if (managersError) {
        console.error('Error getting managers:', managersError);
        throw managersError;
      }

      console.log(`Found ${managers?.length || 0} managers for escalation`);

      // Process each overdue task
      for (const task of overdueTasks) {
        console.log(`Processing overdue task: ${task.task_id}`);

        // Create escalation notifications for all managers
        if (managers && managers.length > 0) {
          const escalationNotifications = managers.map(manager => ({
            user_id: manager.user_id,
            title: 'Overdue Follow-up Task',
            message: `Follow-up task for ${task.restaurant_name} is ${Math.round(task.hours_overdue)} hours overdue. Assigned to: ${task.assigned_user_name}`,
            link: `/tasks`,
          }));

          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(escalationNotifications);

          if (notificationError) {
            console.error('Error creating escalation notifications:', notificationError);
          } else {
            console.log(`Created escalation notifications for task ${task.task_id}`);
          }

          // Create escalation records
          const escalationRecords = managers.map(manager => ({
            task_id: task.task_id,
            escalated_to_user_id: manager.user_id,
            escalation_reason: 'overdue_followup',
          }));

          const { error: escalationError } = await supabase
            .from('follow_up_escalations')
            .insert(escalationRecords);

          if (escalationError) {
            console.error('Error creating escalation records:', escalationError);
          } else {
            console.log(`Created escalation records for task ${task.task_id}`);
          }
        }
      }
    }

    // Check for tasks due in 1 hour and send reminder notifications
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() + 1);
    oneHourAgo.setMinutes(oneHourAgo.getMinutes() - 5); // 5-minute window

    const { data: upcomingTasks, error: upcomingError } = await supabase
      .from('enhanced_tasks')
      .select(`
        id,
        title,
        assigned_to_user_id,
        restaurant_id,
        restaurants!inner(name)
      `)
      .eq('task_type', 'lead_followup')
      .eq('status', 'pending')
      .gte('due_date', oneHourAgo.toISOString())
      .lte('due_date', oneHourFromNow.toISOString());

    if (upcomingError) {
      console.error('Error checking upcoming tasks:', upcomingError);
    } else if (upcomingTasks && upcomingTasks.length > 0) {
      console.log(`Found ${upcomingTasks.length} tasks due in 1 hour`);

      const reminderNotifications = upcomingTasks.map(task => ({
        user_id: task.assigned_to_user_id,
        title: 'Follow-up Reminder',
        message: `Follow-up task "${task.title}" is due in 1 hour`,
        link: `/restaurants/${task.restaurant_id}`,
      }));

      const { error: reminderError } = await supabase
        .from('notifications')
        .insert(reminderNotifications);

      if (reminderError) {
        console.error('Error creating reminder notifications:', reminderError);
      } else {
        console.log('Created reminder notifications for upcoming tasks');
      }
    }

    console.log('Follow-up notifications check completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        overdueTasksProcessed: overdueTasks?.length || 0,
        upcomingReminders: upcomingTasks?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in follow-up notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
