import { FC, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Search, 
  Settings, 
  User, 
  UserPlus,
  CalendarDays 
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps {
  unreadNotifications: number;
}

const Header: FC<HeaderProps> = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  
  // React Strict Mode guard
  const hasInitialized = useRef(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Prevent double mounting in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchUpcomingMeetings = async () => {
      if (!profile?.id) return;
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true })
          .eq('scheduled_by_user_id', profile.id)
          .gte('meeting_date', today.toISOString())
          .in('status', ['SCHEDULED', 'RESCHEDULED']);
          
        if (error) {
          throw error;
        }
        
        setUpcomingMeetings(count || 0);
      } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
      }
    };
    
    fetchUpcomingMeetings();

    return () => {
      hasInitialized.current = false;
    };
  }, [profile?.id]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
      <div className="flex items-center flex-1">
        {/* Mobile Sidebar Trigger - only visible on mobile */}
        <SidebarTrigger className="md:hidden mr-3" />
        
        {/* Desktop Search - hidden on mobile */}
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/notifications')} 
          className="relative"
          title="View notifications"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/leads/meetings')} 
          className="relative"
          title="View meetings"
          aria-label="View meetings"
        >
          <CalendarDays className="h-5 w-5" />
          {upcomingMeetings > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {upcomingMeetings > 9 ? '9+' : upcomingMeetings}
            </span>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={profile?.profile_pic_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm max-md:hidden">
                <span className="font-medium">{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start p-2">
              <div className="flex flex-col space-y-0.5">
                <span className="font-medium text-sm">{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground">{profile?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            {profile?.role === 'admin' && (
              <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Users
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
