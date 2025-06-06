
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatDate } from '@/lib/supabase';

interface LeadActivityTableProps {
  recentActivity: Array<{
    id: string;
    leadName: string;
    status: string;
    assignedTo: string;
    updatedAt: string;
  }>;
}

export const LeadActivityTable = ({ recentActivity }: LeadActivityTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-purple-100 text-purple-800';
      case 'NEEDS FOLLOW UP': return 'bg-yellow-100 text-yellow-800';
      case 'WON': return 'bg-green-100 text-green-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Lead Activity</span>
        </CardTitle>
        <CardDescription>Latest updates and status changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivity.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium">{activity.leadName}</p>
                  <p className="text-sm text-muted-foreground">Assigned to {activity.assignedTo}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(activity.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
