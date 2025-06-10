
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';
import { toast } from 'sonner';

export const useCalendarEvents = (filters?: {
  startDate?: string;
  endDate?: string;
  eventTypes?: string[];
  userId?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['calendar-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          assigned_user:users!calendar_events_assigned_to_user_id_fkey(full_name),
          created_by_user:users!calendar_events_created_by_user_id_fkey(full_name),
          restaurant:restaurants(name, township),
          lead:leads(name),
          order:orders(order_number)
        `)
        .order('start_datetime', { ascending: true });

      if (filters?.startDate) {
        query = query.gte('start_datetime', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_datetime', filters.endDate);
      }
      if (filters?.eventTypes?.length) {
        query = query.in('event_type', filters.eventTypes);
      }
      if (filters?.userId) {
        query = query.or(`assigned_to_user_id.eq.${filters.userId},created_by_user_id.eq.${filters.userId}`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
      }
      
      return data as CalendarEvent[];
    },
    staleTime: 30000,
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
