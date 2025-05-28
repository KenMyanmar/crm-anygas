
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Note } from '@/types/visits';

export const useNotes = (targetType?: string, targetId?: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('notes')
        .select(`
          *,
          author:users!notes_author_uid_fkey (
            full_name
          )
        `);

      if (targetType && targetId) {
        query = query
          .eq('target_type', targetType)
          .eq('target_id', targetId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((note: any) => ({
        ...note,
        author: Array.isArray(note.author) ? note.author[0] : note.author
      }));

      setNotes(transformedData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: Omit<Note, 'id' | 'author_uid' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          author_uid: user.id
        })
        .select(`
          *,
          author:users!notes_author_uid_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author
      };

      setNotes(prev => [transformedData, ...prev]);
      toast({
        title: "Success",
        description: "Note created successfully",
      });

      return transformedData;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateNote = async (id: string, updates: { body: string }) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          author:users!notes_author_uid_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author
      };

      setNotes(prev => prev.map(note => 
        note.id === id ? transformedData : note
      ));

      toast({
        title: "Success",
        description: "Note updated successfully",
      });

      return transformedData;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [targetType, targetId]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};
