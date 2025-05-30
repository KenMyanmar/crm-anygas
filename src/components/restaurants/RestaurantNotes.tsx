import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';

interface RestaurantNote {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author: {
    full_name: string;
  };
}

interface RestaurantNotesProps {
  restaurantId: string;
}

const RestaurantNotes = ({ restaurantId }: RestaurantNotesProps) => {
  const [notes, setNotes] = useState<RestaurantNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [restaurantId]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          body,
          created_at,
          updated_at,
          author:users!notes_author_uid_fkey (
            full_name
          )
        `)
        .eq('target_type', 'restaurant')
        .eq('target_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const notesData = (data || []).map((note: any) => ({
        ...note,
        author: Array.isArray(note.author) ? note.author[0] : note.author
      }));

      setNotes(notesData);

    } catch (error: any) {
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from('notes')
        .insert({
          target_type: 'restaurant',
          target_id: restaurantId,
          body: newNote.trim(),
          author_uid: user.id
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setNewNote('');
      setShowAddForm(false);
      await fetchNotes();

    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Restaurant Notes ({notes.length})
            </CardTitle>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            )}
          </div>
        </CardHeader>
        {showAddForm && (
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Add a note about this restaurant..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddNote} 
                  disabled={isSubmitting || !newNote.trim()}
                  size="sm"
                >
                  {isSubmitting ? "Adding..." : "Add Note"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNote('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">Add the first note about this restaurant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{note.author?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(note.created_at)}</span>
                    {note.updated_at !== note.created_at && (
                      <Badge variant="secondary" className="text-xs">
                        Edited
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantNotes;
