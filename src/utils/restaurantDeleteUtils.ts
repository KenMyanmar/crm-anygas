
import { supabase } from '@/lib/supabase';

export interface DeleteRestaurantResult {
  success: boolean;
  message: string;
}

export interface DeleteAllRestaurantsResult {
  success: boolean;
  deletedCount: number;
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

export const deleteAllRestaurants = async (): Promise<DeleteAllRestaurantsResult> => {
  try {
    console.log('Deleting all restaurants...');
    
    // Call the database function to safely delete all restaurants
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

    console.log('Delete all restaurants result:', result);

    return {
      success: result.success,
      deletedCount: result.deleted_count || 0,
      message: result.message || 'Deletion completed'
    };

  } catch (error: any) {
    console.error('Error in deleteAllRestaurants:', error);
    
    return {
      success: false,
      deletedCount: 0,
      message: error.message || 'An unknown error occurred during deletion'
    };
  }
};
