
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, TrendingUp, Calendar } from 'lucide-react';

interface VisitsMetricsCardsProps {
  totalVisits: number;
  completionRate: number;
  avgDuration: number;
  plannedVisits: number;
}

export const VisitsMetricsCards = ({
  totalVisits,
  completionRate,
  avgDuration,
  plannedVisits
}: VisitsMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{totalVisits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{Math.round(avgDuration)}min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Planned Visits</p>
              <p className="text-2xl font-bold">{plannedVisits}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
