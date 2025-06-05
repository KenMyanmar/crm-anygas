
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  unreadCount: number;
}

const NotificationButton = ({ unreadCount }: NotificationButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Prevent navigation if already on notifications page
    if (location.pathname !== '/notifications') {
      navigate('/notifications');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleClick} 
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
