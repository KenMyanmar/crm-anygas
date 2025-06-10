
import { useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEventModal } from './CalendarEventModal';
import { CalendarEventDetailsModal } from './CalendarEventDetailsModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { Plus, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const startDate = moment(date).startOf('month').subtract(1, 'week').toISOString();
  const endDate = moment(date).endOf('month').add(1, 'week').toISOString();

  const { events, isLoading } = useCalendarEvents({
    startDate,
    endDate,
  });

  const calendarEvents = events?.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_datetime),
    end: event.end_datetime ? new Date(event.end_datetime) : new Date(moment(event.start_datetime).add(1, 'hour').toISOString()),
    allDay: event.all_day,
    resource: event,
  })) || [];

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setShowDetailsModal(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Pre-fill the modal with the selected time slot
    setShowCreateModal(true);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const eventStyleGetter = (event: any) => {
    const eventData = event.resource as CalendarEvent;
    let backgroundColor = '#3174ad';
    
    switch (eventData.event_type) {
      case 'meeting':
        backgroundColor = '#10b981';
        break;
      case 'visit':
        backgroundColor = '#f59e0b';
        break;
      case 'uco_collection':
        backgroundColor = '#8b5cf6';
        break;
      case 'follow_up':
        backgroundColor = '#ef4444';
        break;
      case 'task':
        backgroundColor = '#6366f1';
        break;
      default:
        backgroundColor = '#64748b';
    }

    if (eventData.priority === 'urgent') {
      backgroundColor = '#dc2626';
    } else if (eventData.priority === 'high') {
      backgroundColor = '#ea580c';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: eventData.status === 'completed' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <ModernDashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage all your meetings, visits, tasks, and follow-ups
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        <Tabs value={view} onValueChange={(value) => handleViewChange(value as View)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="month" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Month
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Day
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {moment(date).format('MMMM YYYY')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={setDate}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    step={30}
                    showMultiDayTimes
                    popup
                    className="rbc-calendar"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        <CalendarEventModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        <CalendarEventDetailsModal
          event={selectedEvent}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    </ModernDashboardLayout>
  );
};

export default CalendarPage;
