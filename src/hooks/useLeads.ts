
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Lead {
  id: string;
  name: string;
  status: string;
  assigned_to_user_id: string;
  restaurant_id: string;
  source?: string;
  stage_notes?: string;
  next_action_description?: string;
  next_action_date?: string;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    township?: string;
    phone?: string;
    contact_person?: string;
  };
  assigned_user: {
    full_name: string;
  };
}

export const useLeads = (assignedOnly = false) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('leads')
        .select(`
          *,
          restaurant:restaurants(*),
          assigned_user:users!leads_assigned_to_user_id_fkey(full_name)
        `);

      if (assignedOnly && profile?.id) {
        query = query.eq('assigned_to_user_id', profile.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const transformedData = (data || []).map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        status: lead.status,
        assigned_to_user_id: lead.assigned_to_user_id,
        restaurant_id: lead.restaurant_id,
        source: lead.source,
        stage_notes: lead.stage_notes,
        next_action_description: lead.next_action_description,
        next_action_date: lead.next_action_date,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        restaurant: {
          id: lead.restaurant?.id || '',
          name: lead.restaurant?.name || 'Unknown Restaurant',
          township: lead.restaurant?.township,
          phone: lead.restaurant?.phone,
          contact_person: lead.restaurant?.contact_person,
        },
        assigned_user: {
          full_name: lead.assigned_user?.full_name || 'Unassigned',
        },
      }));

      setLeads(transformedData);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [assignedOnly, profile?.id]);

  const updateLeadStatus = async (leadId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          stage_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Refresh the leads data
      await fetchLeads();
      return true;
    } catch (err: any) {
      console.error('Error updating lead status:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    leads,
    isLoading,
    error,
    refetch: fetchLeads,
    updateLeadStatus,
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, role')
          .eq('is_active', true)
          .order('full_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading };
};
