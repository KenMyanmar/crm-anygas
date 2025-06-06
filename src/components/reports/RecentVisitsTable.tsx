
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { formatDate } from '@/lib/supabase';

interface RecentVisitsTableProps {
  recentVisits: any[];
}

export const RecentVisitsTable = ({ recentVisits }: RecentVisitsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Visit Activity</CardTitle>
        <CardDescription>Latest visit updates and completions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentVisits.slice(0, 5).map((visit, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{visit.restaurant_name}</p>
                  <p className="text-sm text-muted-foreground">{visit.township}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={visit.status === 'VISITED' ? 'default' : 'secondary'}>
                  {visit.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {visit.visit_time ? formatDate(visit.visit_time) : 'TBD'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
