
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface TaskOutcomeData {
  lead_status?: string;
  next_action?: string;
  next_action_date?: string;
  create_order?: boolean;
  order_notes?: string;
  notes?: string;
}

export const useTaskOutcomes = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordTaskOutcome = async (taskId: string, outcomeData: TaskOutcomeData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Recording task outcome:', { taskId, outcomeData });

      // Get the task details first to get restaurant and lead info
      const { data: task, error: taskError } = await supabase
        .from('visit_tasks')
        .select(`
          *,
          restaurant:restaurants(id, name),
          plan:visit_plans(id, title)
        `)
        .eq('id', taskId)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        throw new Error('Failed to fetch task details');
      }

      if (!task) {
        throw new Error('Task not found');
      }

      console.log('Task details:', task);

      // Start a transaction-like operation
      let orderId: string | null = null;

      // Create order if requested
      if (outcomeData.create_order && task.restaurant) {
        console.log('Creating order...');
        
        // Generate order number
        const { data: orderNumberData, error: orderNumberError } = await supabase
          .rpc('generate_order_number');

        if (orderNumberError) {
          console.error('Error generating order number:', orderNumberError);
          throw new Error('Failed to generate order number');
        }

        const orderNumber = orderNumberData || `ORD-${Date.now()}`;

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            restaurant_id: task.restaurant_id,
            order_date: new Date().toISOString(),
            status: 'PENDING_CONFIRMATION',
            total_amount_kyats: 0,
            notes: outcomeData.order_notes,
            created_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw new Error('Failed to create order');
        }

        orderId = orderData?.id || null;
        console.log('Order created:', orderId);
      }

      // Update lead status if there's a lead associated
      if (outcomeData.lead_status && task.restaurant_id) {
        console.log('Updating lead status...');
        
        // Find the lead for this restaurant
        const { data: leads, error: leadFetchError } = await supabase
          .from('leads')
          .select('id')
          .eq('restaurant_id', task.restaurant_id)
          .limit(1);

        if (leadFetchError) {
          console.warn('Error fetching leads:', leadFetchError);
        } else if (leads && leads.length > 0) {
          const leadId = leads[0].id;
          
          const { error: leadUpdateError } = await supabase
            .from('leads')
            .update({
              status: outcomeData.lead_status,
              next_action_description: outcomeData.next_action,
              next_action_date: outcomeData.next_action_date,
              updated_at: new Date().toISOString(),
            })
            .eq('id', leadId);

          if (leadUpdateError) {
            console.error('Error updating lead:', leadUpdateError);
            // Don't throw here, continue with task outcome recording
          } else {
            console.log('Lead updated successfully');
          }
        }
      }

      // Record the task outcome
      console.log('Recording task outcome...');
      const { data: outcomeRecord, error: outcomeError } = await supabase
        .from('task_outcomes')
        .insert({
          task_id: taskId,
          lead_status: outcomeData.lead_status,
          next_action: outcomeData.next_action,
          next_action_date: outcomeData.next_action_date,
          order_id: orderId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (outcomeError) {
        console.error('Error recording task outcome:', outcomeError);
        throw new Error('Failed to record task outcome');
      }

      console.log('Task outcome recorded:', outcomeRecord);

      // Update the visit task status to VISITED
      const { error: taskUpdateError } = await supabase
        .from('visit_tasks')
        .update({
          status: 'VISITED',
          notes: outcomeData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (taskUpdateError) {
        console.error('Error updating task status:', taskUpdateError);
        // Don't throw here, the outcome was recorded successfully
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          target_id: taskId,
          target_type: 'VISIT',
          activity_type: 'OUTCOME_RECORDED',
          activity_message: `Visit outcome recorded for ${task.restaurant?.name}`,
          context_data: {
            lead_status: outcomeData.lead_status,
            order_created: !!orderId,
            restaurant_id: task.restaurant_id,
          },
        });

      toast({
        title: "Success",
        description: `Visit outcome recorded successfully${orderId ? ' and order created' : ''}`,
      });

      return { success: true, orderId };

    } catch (error: any) {
      console.error('Error in recordTaskOutcome:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record task outcome",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    recordTaskOutcome,
    isSubmitting,
  };
};
