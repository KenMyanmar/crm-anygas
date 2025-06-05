
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  unreadCount: number;
}

const NotificationButton = ({ unreadCount }: NotificationButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => navigate('/notifications')} 
      className="relative"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationButton;
