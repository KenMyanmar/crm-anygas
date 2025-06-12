
import { supabase } from '@/lib/supabase';

export interface DeleteRestaurantResult {
  success: boolean;
  message: string;
}

export const deleteRestaurant = async (restaurantId: string): Promise<DeleteRestaurantResult> => {
  try {
    console.log('Deleting restaurant with ID:', restaurantId);
    
    // Call the database function to safely delete the restaurant
    const { data, error } = await supabase.rpc('delete_restaurant_safely', {
      restaurant_uuid: restaurantId
    });

    if (error) {
      console.error('Database function error:', error);
      throw error;
    }

    // The function returns a single row with success and message
    const result = data && data.length > 0 ? data[0] : null;
    
    if (!result) {
      throw new Error('No result returned from deletion function');
    }

    console.log('Delete restaurant result:', result);

    return {
      success: result.success,
      message: result.message || 'Deletion completed'
    };

  } catch (error: any) {
    console.error('Error in deleteRestaurant:', error);
    
    return {
      success: false,
      message: error.message || 'An unknown error occurred during deletion'
    };
  }
};
