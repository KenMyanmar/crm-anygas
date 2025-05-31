
import { supabase } from '@/lib/supabase';

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  message: string;
}

export const deleteAllRestaurants = async (): Promise<DeleteResult> => {
  try {
    console.log('Starting restaurant deletion using database function...');
    
    // Call the new PostgreSQL function that handles all foreign key dependencies properly
    const { data, error } = await supabase.rpc('delete_all_restaurants_safely');

    if (error) {
      console.error('Database function error:', error);
      throw error;
    }

    // The function returns a single row with success, deleted_count, and message
    const result = data && data.length > 0 ? data[0] : null;
    
    if (!result) {
      throw new Error('No result returned from deletion function');
    }

    console.log('Database function result:', result);

    return {
      success: result.success,
      deletedCount: result.deleted_count || 0,
      message: result.message || 'Deletion completed'
    };

  } catch (error: any) {
    console.error('Error in deleteAllRestaurants:', error);
    
    // Log the error to migration_log for tracking
    try {
      await supabase
        .from('migration_log')
        .insert({
          action: 'DELETE_ALL_ERROR',
          table_name: 'restaurants',
          details: {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return {
      success: false,
      deletedCount: 0,
      message: error.message || 'An unknown error occurred during deletion'
    };
  }
};
