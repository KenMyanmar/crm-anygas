
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
      
      // Use the detailed view for comprehensive data
      let query = supabase
        .from('visit_tasks_detailed')
        .select('*');

      if (planId) {
        query = query.eq('plan_id', planId);
      }

      const { data, error } = await query
        .order('visit_sequence', { ascending: true });

      if (error) throw error;

      const transformedData = (data || []).map((task: any) => ({
        id: task.id,
        plan_id: task.plan_id,
        restaurant_id: task.restaurant_id,
        salesperson_uid: task.salesperson_uid,
        status: task.status,
        visit_time: task.visit_time,
        notes: task.notes,
        visit_sequence: task.visit_sequence,
        estimated_duration_minutes: task.estimated_duration_minutes,
        priority_level: task.priority_level,
        created_at: task.created_at,
        updated_at: task.updated_at,
        restaurant: {
          id: task.restaurant_id,
          name: task.restaurant_name,
          township: task.township,
          contact_person: task.contact_person,
          phone: task.phone,
          address: task.address
        },
        lead_status: task.lead_status,
        next_action_date: task.next_action_date,
        lead_assigned_to: task.lead_assigned_to,
        lead_assigned_user_name: task.lead_assigned_user_name
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
        .select()
        .single();

      if (error) throw error;

      // Refresh the tasks to get the detailed view
      await fetchVisitTasks();

      toast({
        title: "Success",
        description: "Visit task created successfully",
      });

      return data;
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
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately for better UX
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));

      toast({
        title: "Success",
        description: "Visit task updated successfully",
      });

      return data;
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

  const createOrder = async (restaurantId: string, leadId: string | null, orderNotes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        // Fallback to simple order number if function fails
        const orderNumber = `ORD-${Date.now()}`;
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: restaurantId,
            lead_id: leadId,
            order_number: orderNumber,
            order_date: new Date().toISOString(),
            status: 'PENDING_CONFIRMATION',
            total_amount_kyats: 0,
            notes: orderNotes,
            created_by_user_id: user.id
          })
          .select()
          .single();

        if (orderError) throw orderError;
        return orderData;
      } else {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: restaurantId,
            lead_id: leadId,
            order_number: orderNumberData,
            order_date: new Date().toISOString(),
            status: 'PENDING_CONFIRMATION',
            total_amount_kyats: 0,
            notes: orderNotes,
            created_by_user_id: user.id
          })
          .select()
          .single();

        if (orderError) throw orderError;
        return orderData;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const recordTaskOutcome = async (taskId: string, outcomeData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      let orderId = null;

      // Create order if requested
      if (outcomeData.create_order && outcomeData.order_notes) {
        try {
          // Find the lead for this restaurant
          const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('id')
            .eq('restaurant_id', task.restaurant_id)
            .single();

          const leadId = leadData?.id || null;
          
          const orderData = await createOrder(task.restaurant_id, leadId, outcomeData.order_notes);
          orderId = orderData.id;

          toast({
            title: "Order Created",
            description: `Order ${orderData.order_number} has been created successfully`,
          });
        } catch (orderError) {
          console.error('Error creating order:', orderError);
          toast({
            title: "Warning",
            description: "Outcome recorded but order creation failed. You can create the order manually.",
            variant: "destructive",
          });
        }
      }

      // Insert the task outcome
      const { data, error } = await supabase
        .from('task_outcomes')
        .insert({
          task_id: taskId,
          lead_status: outcomeData.lead_status,
          order_id: orderId,
          next_action: outcomeData.next_action,
          next_action_date: outcomeData.next_action_date,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update the task status to VISITED
      await updateVisitTask(taskId, { status: 'VISITED' });

      // If lead status was updated, update the lead as well
      if (outcomeData.lead_status && task.restaurant_id) {
        const { error: leadError } = await supabase
          .from('leads')
          .update({
            status: outcomeData.lead_status,
            next_action_description: outcomeData.next_action,
            next_action_date: outcomeData.next_action_date
          })
          .eq('restaurant_id', task.restaurant_id);

        if (leadError) {
          console.error('Error updating lead:', leadError);
          // Don't throw here as the main outcome was recorded successfully
        }
      }

      // Refresh the tasks to get updated data
      await fetchVisitTasks();

      toast({
        title: "Success",
        description: orderId 
          ? "Task outcome recorded and order created successfully"
          : "Task outcome recorded successfully",
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
