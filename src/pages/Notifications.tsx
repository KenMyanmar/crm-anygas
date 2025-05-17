
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { UserNotification } from '@/types';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BellOff } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Transform the data to match UserNotification type
      const transformedData: UserNotification[] = data.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        message: item.message,
        link: item.link,
        read: item.is_read, // Note the field name difference
        created_at: item.created_at
      }));
      
      setNotifications(transformedData);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!profile?.id || notifications.length === 0) return;
      
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
        
      if (error) {
        throw error;
      }
      
      // Update local state to reflect all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <Button 
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.read) || isLoading}
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
          onMarkAsRead={handleMarkAsRead}
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
