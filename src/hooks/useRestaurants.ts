
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  township?: string;
  phone?: string;
  contact_person?: string;
  remarks?: string;
  salesperson_id: string;
  created_at: string;
  updated_at: string;
}

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setRestaurants(data || []);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    isLoading,
    error,
    refetch: fetchRestaurants,
  };
};
