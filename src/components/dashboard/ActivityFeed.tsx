
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityLog } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { User, Package, FileText, Phone, ShieldAlert } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const getActivityIcon = (targetType: string | undefined) => {
  switch(targetType) {
    case 'USER':
      return <User className="h-4 w-4" />;
    case 'ORDER':
      return <Package className="h-4 w-4" />;
    case 'LEAD':
      return <FileText className="h-4 w-4" />;
    case 'CALL_LOG':
      return <Phone className="h-4 w-4" />;
    case 'SYSTEM':
      return <ShieldAlert className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent activity to display.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => {
              const activityDate = new Date(activity.created_at);
              const timeAgo = formatDistanceToNow(activityDate, { addSuffix: true });
              const formattedTime = format(activityDate, 'h:mm a');
              
              return (
                <div key={activity.id} className="flex space-x-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.target_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm">{activity.activity_message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {timeAgo} at {formattedTime}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
