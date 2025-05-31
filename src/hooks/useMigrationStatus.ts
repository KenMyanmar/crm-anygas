
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MigrationLog {
  id: string;
  action: string;
  table_name?: string;
  record_count?: number;
  details?: any;
  created_at: string;
}

export const useMigrationStatus = () => {
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('migration_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching migration logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStagingData = async () => {
    try {
      await supabase.from('restaurants_staging').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('restaurant_id_mapping').delete().neq('old_restaurant_id', '00000000-0000-0000-0000-000000000000');
      
      await supabase
        .from('migration_log')
        .insert({
          action: 'STAGING_CLEARED',
          details: { message: 'Staging data cleared' },
        });
      
      await fetchLogs();
      return { success: true };
    } catch (error: any) {
      console.error('Error clearing staging data:', error);
      return { success: false, error: error.message };
    }
  };

  const createRollbackPoint = async () => {
    try {
      await supabase
        .from('migration_log')
        .insert({
          action: 'ROLLBACK_POINT_CREATED',
          details: { 
            message: 'Rollback point created',
            timestamp: new Date().toISOString(),
          },
        });
      
      await fetchLogs();
      return { success: true };
    } catch (error: any) {
      console.error('Error creating rollback point:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    isLoading,
    refetch: fetchLogs,
    clearStagingData,
    createRollbackPoint,
  };
};
