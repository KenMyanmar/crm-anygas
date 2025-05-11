
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserNotification } from '@/types';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationsCardProps {
  notifications: UserNotification[];
}

const NotificationsCard = ({ notifications }: NotificationsCardProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
            {unreadCount} unread
          </div>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No notifications to display.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => {
              const notificationDate = new Date(notification.created_at);
              const formattedDate = format(notificationDate, 'MMM d, h:mm a');
              
              return (
                <Link
                  to={notification.link || '#'}
                  key={notification.id}
                  className={`block p-3 rounded-md ${
                    !notification.read
                      ? 'bg-primary/5 hover:bg-primary/10'
                      : 'hover:bg-muted'
                  } transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      !notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
