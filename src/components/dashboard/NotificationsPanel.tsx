
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationsPanel = ({ notifications, onMarkAsRead }: NotificationsPanelProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No notifications.
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
            {notifications.map(notification => {
              const date = parseISO(notification.created_at);
              const timeAgo = formatDistanceToNow(date, { addSuffix: true });
              
              return (
                <div 
                  key={notification.id} 
                  className={`
                    p-3 rounded-md transition-colors
                    ${notification.read 
                      ? 'bg-muted/30 hover:bg-muted/50' 
                      : 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-medium ${notification.read ? '' : 'text-primary'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo}
                    </span>
                    {notification.link && (
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        View
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {notifications.length > 5 && (
          <div className="flex justify-center mt-4">
            <Button variant="link" size="sm">
              View All Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
