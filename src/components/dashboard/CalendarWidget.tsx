
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useEnhancedTasks } from '@/hooks/useEnhancedTasks';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CalendarWidget = () => {
  const today = new Date();
  const weekFromNow = addDays(today, 7);

  const { events } = useCalendarEvents({
    startDate: today.toISOString(),
    endDate: weekFromNow.toISOString(),
  });

  const { tasks } = useEnhancedTasks({
    status: ['pending', 'in_progress'],
    dueDate: weekFromNow.toISOString(),
  });

  const upcomingItems = [
    ...(events?.slice(0, 3) || []).map(event => ({
      id: event.id,
      title: event.title,
      type: 'event' as const,
      datetime: event.start_datetime,
      priority: event.priority,
      event_type: event.event_type,
    })),
    ...(tasks?.slice(0, 3) || []).map(task => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      datetime: task.due_date || task.created_at,
      priority: task.priority,
      task_type: task.task_type,
    })),
  ]
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .slice(0, 5);

  const getItemColor = (item: any) => {
    if (item.type === 'event') {
      switch (item.event_type) {
        case 'meeting': return 'bg-green-100 text-green-800';
        case 'visit': return 'bg-yellow-100 text-yellow-800';
        case 'uco_collection': return 'bg-purple-100 text-purple-800';
        case 'follow_up': return 'bg-red-100 text-red-800';
        default: return 'bg-blue-100 text-blue-800';
      }
    } else {
      switch (item.task_type) {
        case 'lead_followup': return 'bg-blue-100 text-blue-800';
        case 'meeting_prep': return 'bg-green-100 text-green-800';
        case 'uco_collection': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Events & Tasks
        </CardTitle>
        <div className="flex space-x-1">
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingItems.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming events or tasks</p>
            <Link to="/calendar">
              <Button variant="outline" size="sm" className="mt-2">
                Create Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getItemColor(item)} variant="secondary">
                      {item.type === 'event' ? item.event_type.replace('_', ' ') : item.task_type.replace('_', ' ')}
                    </Badge>
                    <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(item.datetime), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <Link to="/calendar" className="text-xs text-primary hover:underline">
                View all in calendar →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
