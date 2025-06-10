
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Flag, Edit, Trash2 } from 'lucide-react';

interface CalendarEventDetailsModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

export const CalendarEventDetailsModal = ({ event, open, onClose }: CalendarEventDetailsModalProps) => {
  const { deleteEvent } = useCalendarEvents();

  if (!event) return null;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent.mutateAsync(event.id);
      onClose();
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'visit': return 'bg-yellow-100 text-yellow-800';
      case 'uco_collection': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-red-100 text-red-800';
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <div className="flex items-center space-x-2">
              <Badge className={getEventTypeColor(event.event_type)}>
                {event.event_type.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                {event.priority}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(event.start_datetime), 'PPP')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {event.all_day ? (
                    'All Day'
                  ) : (
                    `${format(new Date(event.start_datetime), 'p')} - ${
                      event.end_datetime ? format(new Date(event.end_datetime), 'p') : 'No end time'
                    }`
                  )}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>Status: {event.status.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>

          {event.description && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Created: {format(new Date(event.created_at), 'PPp')}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
