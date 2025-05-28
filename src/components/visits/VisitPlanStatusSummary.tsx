
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitTask } from '@/types/visits';

interface VisitPlanStatusSummaryProps {
  tasks: VisitTask[];
}

const VisitPlanStatusSummary = ({ tasks }: VisitPlanStatusSummaryProps) => {
  const planStats = {
    planned: tasks.filter(t => t.status === 'PLANNED').length,
    visited: tasks.filter(t => t.status === 'VISITED').length,
    rescheduled: tasks.filter(t => t.status === 'RESCHEDULED').length,
    canceled: tasks.filter(t => t.status === 'CANCELED').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Planned: {planStats.planned}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Visited: {planStats.visited}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Rescheduled: {planStats.rescheduled}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Canceled: {planStats.canceled}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitPlanStatusSummary;
