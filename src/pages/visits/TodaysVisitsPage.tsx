
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QuickMapAccess from '@/components/visits/QuickMapAccess';
import { 
  Calendar, 
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Navigation,
  Phone,
  User
} from 'lucide-react';
import { format, isToday } from 'date-fns';

const TodaysVisitsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { tasks, isLoading } = useVisitTasks();

  // Filter tasks for today only
  const todaysTasks = tasks.filter(task => {
    if (!task.visit_time) return false;
    return isToday(new Date(task.visit_time));
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VISITED': return 'bg-green-100 text-green-800';
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordOutcome = (taskId: string) => {
    navigate(`/visits/tasks/${taskId}/outcome`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading today's visits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today's Visits</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')} • {todaysTasks.length} visits scheduled
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <QuickMapAccess tasks={todaysTasks} />
          <Button 
            variant="outline"
            onClick={() => navigate('/visits')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View All Plans
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Planned</p>
                <p className="text-2xl font-bold">{todaysTasks.filter(t => t.status === 'PLANNED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{todaysTasks.filter(t => t.status === 'VISITED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Remaining</p>
                <p className="text-2xl font-bold">{todaysTasks.filter(t => t.status === 'PLANNED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Est. Time</p>
                <p className="text-2xl font-bold">{Math.round(todaysTasks.reduce((acc, t) => acc + (t.estimated_duration_minutes || 60), 0) / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {todaysTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No visits scheduled for today</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any visits planned for today. Create a visit plan to get started.
            </p>
            <Button onClick={() => navigate('/visits/new')}>
              Create Visit Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Alert>
            <Navigation className="h-4 w-4" />
            <AlertDescription>
              <strong>Today's Route:</strong> You have {todaysTasks.length} visits scheduled. Use the Route Map to plan your journey efficiently.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {todaysTasks
              .sort((a, b) => (a.visit_sequence || 0) - (b.visit_sequence || 0))
              .map((task, index) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{task.restaurant?.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {task.restaurant?.township && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {task.restaurant.township}
                              </div>
                            )}
                            {task.visit_time && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(task.visit_time), 'h:mm a')}
                              </div>
                            )}
                            {task.restaurant?.contact_person && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {task.restaurant.contact_person}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(task.status || 'PLANNED')}>
                            {task.status || 'PLANNED'}
                          </Badge>
                          {task.priority_level && (
                            <Badge variant="outline">
                              {task.priority_level} Priority
                            </Badge>
                          )}
                          {task.estimated_duration_minutes && (
                            <Badge variant="outline">
                              {task.estimated_duration_minutes}min
                            </Badge>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-sm text-muted-foreground">{task.notes}</p>
                        )}

                        {task.restaurant?.address && (
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {task.restaurant.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {task.restaurant?.phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                      
                      {task.status === 'PLANNED' ? (
                        <Button 
                          size="sm"
                          onClick={() => handleRecordOutcome(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      ) : task.status === 'VISITED' ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRecordOutcome(task.id)}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysVisitsPage;
