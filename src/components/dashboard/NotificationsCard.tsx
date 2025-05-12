
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserNotification } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NotificationsCardProps {
  notifications: UserNotification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationsCard = ({ notifications, onMarkAsRead }: NotificationsCardProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Sort notifications by date (newest first) and read status (unread first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by read status
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Then by date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
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
            {sortedNotifications.map(notification => {
              const notificationDate = new Date(notification.created_at);
              const timeAgo = formatDistanceToNow(notificationDate, { addSuffix: true });
              
              return (
                <div
                  key={notification.id}
                  className={`relative p-3 rounded-md ${
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
                      <Link to={notification.link || '#'} className="block">
                        <div className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {timeAgo}
                        </div>
                      </Link>
                    </div>
                    
                    {!notification.read && onMarkAsRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {notifications.length > 5 && (
              <Button variant="link" className="w-full mt-2">
                View All Notifications
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
