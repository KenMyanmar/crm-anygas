
import { supabase } from '@/lib/supabase';

export const getAuditLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('migration_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};
