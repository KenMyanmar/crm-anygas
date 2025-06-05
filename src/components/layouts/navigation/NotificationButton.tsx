
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
      className="relative h-9 w-9 md:h-10 md:w-10"
    >
      <Bell className="h-4 w-4 md:h-5 md:w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center rounded-full bg-destructive text-[9px] md:text-[10px] text-destructive-foreground font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationButton;
