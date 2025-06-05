
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { 
  LogOut,
  User,
  Settings,
  UserPlus,
  ChevronDown
} from 'lucide-react';

const UserMenu = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.profile_pic_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-sm">
            <span className="font-medium">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
          </div>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8} 
        className="w-56 z-50 bg-popover border shadow-lg rounded-md"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <span className="font-medium text-sm">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground">{profile?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
        >
          <User className="w-4 h-4 mr-3" />
          My Profile
        </DropdownMenuItem>
        {profile?.role === 'admin' && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin/users')}
            className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-3" />
            Manage Users
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={signOut}
          className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
