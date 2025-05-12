
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityLog } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { User, Package, FileText, Phone, ShieldAlert, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    case 'NOTIFICATION':
      return <Bell className="h-4 w-4" />;
    case 'SYSTEM':
      return <ShieldAlert className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getActivityIconBackground = (targetType: string | undefined) => {
  switch(targetType) {
    case 'USER':
      return 'bg-blue-100 text-blue-600';
    case 'ORDER':
      return 'bg-purple-100 text-purple-600';
    case 'LEAD':
      return 'bg-green-100 text-green-600';
    case 'CALL_LOG':
      return 'bg-amber-100 text-amber-600';
    case 'NOTIFICATION':
      return 'bg-pink-100 text-pink-600';
    case 'SYSTEM':
      return 'bg-red-100 text-red-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent activity to display.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map(activity => {
              const activityDate = new Date(activity.created_at);
              const timeAgo = formatDistanceToNow(activityDate, { addSuffix: true });
              const formattedTime = format(activityDate, 'h:mm a');
              const iconBgClass = getActivityIconBackground(activity.target_type);
              
              return (
                <div key={activity.id} className="flex space-x-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}>
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
