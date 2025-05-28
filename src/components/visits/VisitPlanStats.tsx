
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { VisitTask } from '@/types/visits';

interface VisitPlanStatsProps {
  tasks: VisitTask[];
}

const VisitPlanStats = ({ tasks }: VisitPlanStatsProps) => {
  const planStats = {
    totalTasks: tasks.length,
    planned: tasks.filter(t => t.status === 'PLANNED').length,
    visited: tasks.filter(t => t.status === 'VISITED').length,
    rescheduled: tasks.filter(t => t.status === 'RESCHEDULED').length,
    canceled: tasks.filter(t => t.status === 'CANCELED').length,
    estimatedDuration: tasks.reduce((sum, t) => sum + (t.estimated_duration_minutes || 60), 0),
    townships: [...new Set(tasks.map(t => t.restaurant?.township).filter(Boolean))].length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{planStats.totalTasks}</p>
            </div>
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Townships</p>
              <p className="text-2xl font-bold">{planStats.townships}</p>
            </div>
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
              <p className="text-2xl font-bold">{Math.round(planStats.estimatedDuration / 60)}h</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{planStats.visited}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {planStats.totalTasks > 0 ? Math.round((planStats.visited / planStats.totalTasks) * 100) : 0}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitPlanStats;
