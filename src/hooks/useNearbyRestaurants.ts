
import { useState, useCallback } from 'react';
import { NearbyRestaurantService, NearbyRestaurant } from '@/services/nearbyRestaurantService';
import { RestaurantMatchingService } from '@/services/restaurantMatchingService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useNearbyRestaurants = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  const nearbyService = new NearbyRestaurantService(
    'AIzaSyDGPGzAYJtZEG0j7i8-J8nJkNZEg8DkdEY' // You can move this to env later
  );
  const matchingService = new RestaurantMatchingService();

  const findNearbyRestaurants = useCallback(async (lat: number, lng: number, radius?: number) => {
    if (!lat || !lng) {
      toast.error('Location coordinates are required');
      return;
    }

    setLoading(true);
    try {
      console.log(`Finding nearby restaurants at ${lat}, ${lng}`);
      
      // Find nearby restaurants using Google Places API
      const nearbyRestaurants = await nearbyService.findNearbyRestaurants(lat, lng, radius);
      console.log(`Found ${nearbyRestaurants.length} nearby restaurants`);

      // Check which ones already exist in our database
      const restaurantsWithExistingCheck = await matchingService.checkExistingRestaurants(nearbyRestaurants);
      
      setRestaurants(restaurantsWithExistingCheck);
      setSelectedRestaurants([]);
      
      const newCount = restaurantsWithExistingCheck.filter(r => !r.is_existing).length;
      const existingCount = restaurantsWithExistingCheck.filter(r => r.is_existing).length;
      
      toast.success(`Found ${nearbyRestaurants.length} restaurants nearby. ${newCount} new, ${existingCount} already in database.`);
    } catch (error) {
      console.error('Error finding nearby restaurants:', error);
      toast.error('Failed to find nearby restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRestaurantSelection = useCallback((placeId: string) => {
    setSelectedRestaurants(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  }, []);

  const selectAllNewRestaurants = useCallback(() => {
    const newRestaurantIds = restaurants
      .filter(r => !r.is_existing)
      .map(r => r.place_id);
    setSelectedRestaurants(newRestaurantIds);
  }, [restaurants]);

  const clearSelection = useCallback(() => {
    setSelectedRestaurants([]);
  }, []);

  const addSelectedToDatabase = useCallback(async () => {
    if (!profile?.id) {
      toast.error('User profile not found');
      return false;
    }

    if (selectedRestaurants.length === 0) {
      toast.error('Please select at least one restaurant to add');
      return false;
    }

    setLoading(true);
    try {
      const selectedRestaurantData = restaurants.filter(r => 
        selectedRestaurants.includes(r.place_id) && !r.is_existing
      );

      const success = await matchingService.addNewRestaurants(selectedRestaurantData, profile.id);
      
      if (success) {
        toast.success(`Successfully added ${selectedRestaurantData.length} restaurants to database`);
        
        // Mark added restaurants as existing
        setRestaurants(prev => prev.map(r => 
          selectedRestaurants.includes(r.place_id) ? { ...r, is_existing: true } : r
        ));
        setSelectedRestaurants([]);
        return true;
      } else {
        toast.error('Failed to add restaurants to database');
        return false;
      }
    } catch (error) {
      console.error('Error adding restaurants:', error);
      toast.error('An error occurred while adding restaurants');
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurants, restaurants, profile]);

  return {
    loading,
    restaurants,
    selectedRestaurants,
    findNearbyRestaurants,
    toggleRestaurantSelection,
    selectAllNewRestaurants,
    clearSelection,
    addSelectedToDatabase
  };
};
