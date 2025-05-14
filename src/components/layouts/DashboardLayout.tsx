

import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Sidebar, 
  SidebarTrigger, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  useSidebar 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Bell, ChevronDown, FileText, Home, LogOut, Settings, User, Users, Package, UserPlus, Search, BarChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

const NavMenu = () => {
  const { profile } = useAuth();
  const sidebar = useSidebar();
  const isAdmin = profile?.role === 'admin';

  const MenuLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    // Determine if the current link is active
    const getNavClass = ({ isActive }: { isActive: boolean }) => {
      return `flex items-center py-2 px-3 rounded-md transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      }`;
    };

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink to={to} className={getNavClass} end>
            <Icon className="h-5 w-5 mr-2" />
            {!sidebar.state.includes("collapsed") && <span>{label}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>General</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <MenuLink to="/" icon={Home} label="Dashboard" />
            <MenuLink to="/leads" icon={FileText} label="Leads" />
            <MenuLink to="/restaurants" icon={Search} label="Restaurants" />
            <MenuLink to="/orders" icon={Package} label="Orders" />
            <MenuLink to="/reports" icon={BarChart} label="Reports" />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/admin/users" icon={Users} label="Users" />
              <MenuLink to="/admin/products" icon={Package} label="Products" />
              <MenuLink to="/admin/import" icon={FileText} label="Import Data" />
              <MenuLink to="/admin/settings" icon={Settings} label="Settings" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !profile) {
      navigate('/login');
    }
  }, [profile, isLoading, navigate]);

  // Mock data for unread notifications count
  useEffect(() => {
    // In production, this would fetch from the database
    setUnreadNotifications(3);
  }, []);

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

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-8 bg-muted rounded mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar className="transition-all duration-300" collapsible="icon">
        <div className="h-16 border-b flex items-center px-3">
          <div className="flex-1 overflow-hidden">
            {useSidebar().state !== "collapsed" && (
              <div className="font-semibold text-lg truncate">
                ANY GAS Myanmar
              </div>
            )}
          </div>
          <SidebarTrigger />
        </div>
        <SidebarContent>
          <NavMenu />
        </SidebarContent>
      </Sidebar>
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
          <div className="flex-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm max-md:hidden">
                    <span className="font-medium">{profile.full_name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{profile.role}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-medium text-sm">{profile.full_name}</span>
                    <span className="text-xs text-muted-foreground">{profile.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {profile.role === 'admin' && (
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
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
