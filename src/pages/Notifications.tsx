
import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BellOff } from 'lucide-react';

const NotificationsPage = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    unreadCount
  } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <Button 
          variant="outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isLoading}
        >
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-2">
            <div className="h-6 w-2/3 bg-muted/60 animate-pulse rounded"></div>
            <div className="h-4 w-full bg-muted/60 animate-pulse rounded"></div>
            <div className="h-4 w-5/6 bg-muted/60 animate-pulse rounded"></div>
          </div>
        </Card>
      ) : notifications.length > 0 ? (
        <NotificationsCard 
          notifications={notifications} 
          onMarkAsRead={markAsRead}
        />
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-3">
              <BellOff className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mt-2">No notifications</h3>
            <p className="text-muted-foreground">
              You don't have any notifications at this time.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
