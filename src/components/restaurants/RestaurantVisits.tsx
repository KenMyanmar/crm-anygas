
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Clock, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';

interface RestaurantVisit {
  id: string;
  visit_time?: string;
  status: string;
  notes?: string;
  priority_level: string;
  estimated_duration_minutes: number;
  created_at: string;
  salesperson: {
    full_name: string;
  };
  task_outcomes?: Array<{
    next_action?: string;
    next_action_date?: string;
    lead_status?: string;
  }>;
}

interface RestaurantVisitsProps {
  restaurantId: string;
}

const RestaurantVisits = ({ restaurantId }: RestaurantVisitsProps) => {
  const [visits, setVisits] = useState<RestaurantVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    completedVisits: 0,
    plannedVisits: 0,
    totalDuration: 0
  });

  useEffect(() => {
    fetchVisits();
  }, [restaurantId]);

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('visit_tasks')
        .select(`
          id,
          visit_time,
          status,
          notes,
          priority_level,
          estimated_duration_minutes,
          created_at,
          salesperson:users!visit_tasks_salesperson_uid_fkey (
            full_name
          ),
          task_outcomes (
            next_action,
            next_action_date,
            lead_status
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const visitsData = (data || []).map((visit: any) => ({
        ...visit,
        salesperson: Array.isArray(visit.salesperson) ? visit.salesperson[0] : visit.salesperson
      }));

      setVisits(visitsData);

      // Calculate stats
      const totalDuration = visitsData.reduce((sum, visit) => 
        sum + (visit.estimated_duration_minutes || 0), 0
      );
      const completedVisits = visitsData.filter(visit => 
        visit.status === 'COMPLETED'
      ).length;
      const plannedVisits = visitsData.filter(visit => 
        ['PLANNED', 'IN_PROGRESS'].includes(visit.status)
      ).length;

      setStats({
        totalVisits: visitsData.length,
        completedVisits,
        plannedVisits,
        totalDuration
      });

    } catch (error: any) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Error",
        description: "Failed to load visits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-2xl font-bold">{stats.plannedVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-lg font-bold">{Math.round(stats.totalDuration / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Visit History ({visits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
              <p className="text-gray-500">No visits have been scheduled for this restaurant yet.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className="text-sm">
                          {visit.visit_time ? (
                            <div>
                              <div>{formatDate(visit.visit_time)}</div>
                              <div className="text-muted-foreground">
                                {new Date(visit.visit_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">TBD</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(visit.status)}>
                          {visit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(visit.priority_level)}>
                          {visit.priority_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{visit.estimated_duration_minutes}min</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{visit.salesperson?.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {visit.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {visit.task_outcomes && visit.task_outcomes.length > 0 ? (
                            <div>
                              {visit.task_outcomes[0].next_action && (
                                <div className="text-muted-foreground">
                                  {visit.task_outcomes[0].next_action}
                                </div>
                              )}
                              {visit.task_outcomes[0].next_action_date && (
                                <div className="text-xs text-muted-foreground">
                                  Next: {formatDate(visit.task_outcomes[0].next_action_date)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantVisits;
