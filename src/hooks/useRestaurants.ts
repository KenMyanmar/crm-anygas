
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
  gas_customer_status?: string;
  uco_supplier_status?: string;
  avg_uco_volume_kg?: number;
  uco_price_per_kg?: number;
  last_uco_collection_date?: string;
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
        .select(`
          *,
          avg_uco_volume_kg,
          uco_price_per_kg,
          last_uco_collection_date
        `)
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
