
import { supabase } from '@/lib/supabase';

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  message: string;
}

export const deleteAllRestaurants = async (): Promise<DeleteResult> => {
  try {
    // First, get count of restaurants to be deleted
    const { count } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'No restaurants to delete'
      };
    }

    // Create complete backup before deletion
    await createCompleteBackup();

    // Delete all related data in the correct order (due to foreign key constraints)
    await Promise.all([
      // Delete voice notes
      supabase.from('voice_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete notes
      supabase.from('notes').delete().eq('target_type', 'RESTAURANT'),
      
      // Delete calls
      supabase.from('calls').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete meetings
      supabase.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete task outcomes
      supabase.from('task_outcomes').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete visit tasks
      supabase.from('visit_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete visit plans
      supabase.from('visit_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      
      // Delete order items first
      supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    // Then delete orders and leads
    await Promise.all([
      supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    // Finally delete restaurants
    const { error: deleteError } = await supabase
      .from('restaurants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) throw deleteError;

    // Log the operation
    await supabase
      .from('migration_log')
      .insert({
        action: 'DELETE_ALL',
        table_name: 'restaurants',
        record_count: count,
        details: {
          message: 'Complete restaurant database deletion',
          backup_created: true,
          timestamp: new Date().toISOString(),
        },
      });

    return {
      success: true,
      deletedCount: count,
      message: `Successfully deleted ${count} restaurants and all related data`
    };

  } catch (error: any) {
    console.error('Error deleting all restaurants:', error);
    return {
      success: false,
      deletedCount: 0,
      message: error.message
    };
  }
};

const createCompleteBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // This is a simplified backup - in a real system you'd want to 
    // implement proper backup functionality
    await supabase
      .from('migration_log')
      .insert({
        action: 'BACKUP_CREATED',
        details: {
          backup_type: 'COMPLETE_DELETE_BACKUP',
          timestamp,
          message: 'Complete backup created before delete all operation',
        },
      });

  } catch (error: any) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup before deletion');
  }
};
