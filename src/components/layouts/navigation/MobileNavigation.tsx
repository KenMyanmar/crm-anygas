
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu,
  Home, 
  Users, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  BarChart, 
  Settings,
  Search,
  Plus,
  User,
  CalendarDays,
  MapPin,
  Package,
  Bell,
  LogOut,
  UserPlus,
  Truck,
  Route,
  Activity,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  unreadNotifications: number;
}

const MobileNavigation = ({ unreadNotifications }: MobileNavigationProps) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    setOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const NavButton = ({ 
    icon: Icon, 
    label, 
    path, 
    badge 
  }: { 
    icon: React.ComponentType<any>; 
    label: string; 
    path: string; 
    badge?: number; 
  }) => (
    <button
      onClick={() => handleNavigation(path)}
      className={cn(
        "flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors min-h-[44px]",
        isActive(path)
          ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-medium">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L4 9V21H20V9L12 3Z" />
            </svg>
            <SheetTitle className="text-lg font-bold">ANY GAS Myanmar</SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-2 py-4 space-y-1">
          {/* User Profile Section */}
          <div className="px-4 py-3 mb-4 bg-muted/30 rounded-lg mx-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.profile_pic_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <SectionHeader title="Main" />
          <NavButton icon={Home} label="Dashboard" path="/" />
          <NavButton icon={Bell} label="Notifications" path="/notifications" badge={unreadNotifications} />

          <Separator className="my-4 mx-4" />

          {/* Business Sections */}
          <SectionHeader title="Business" />
          <NavButton icon={Users} label="All Restaurants" path="/restaurants" />
          <NavButton icon={Plus} label="New Restaurant" path="/restaurants/new" />
          
          <NavButton icon={FileText} label="All Leads" path="/leads" />
          <NavButton icon={User} label="Assigned to Me" path="/leads/assigned" />
          <NavButton icon={CalendarDays} label="Meetings" path="/leads/meetings" />
          
          <NavButton icon={Calendar} label="Visit Planner" path="/visits" />
          <NavButton icon={MapPin} label="Today's Visits" path="/visits/today" />

          <Separator className="my-2 mx-4" />
          <SectionHeader title="UCO Operations" />
          <NavButton icon={Truck} label="UCO Dashboard" path="/uco/dashboard" />
          <NavButton icon={Calendar} label="Collection Plans" path="/uco/planner" />
          <NavButton icon={Route} label="Route Optimizer" path="/uco/routes" />
          <NavButton icon={Building2} label="Restaurant Leads" path="/uco/restaurant-leads" />
          <NavButton icon={MapPin} label="Driver Interface" path="/uco/mobile" />
          <NavButton icon={Activity} label="UCO Analytics" path="/uco/analytics" />

          <Separator className="my-2 mx-4" />
          <NavButton icon={ShoppingCart} label="Order Management" path="/orders" />
          <NavButton icon={Plus} label="Create Order" path="/orders/new" />
          
          <NavButton icon={BarChart} label="Sales Reports" path="/reports" />
          <NavButton icon={BarChart} label="Performance" path="/reports/performance" />

          {/* Admin Section */}
          {isAdminOrManager && (
            <>
              <Separator className="my-4 mx-4" />
              <SectionHeader title="Administration" />
              {profile?.role === 'admin' && (
                <NavButton icon={Users} label="Users" path="/admin/users" />
              )}
              <NavButton icon={Package} label="Products" path="/admin/products" />
              <NavButton icon={Settings} label="Settings" path="/admin/settings" />
            </>
          )}

          {/* User Actions */}
          <Separator className="my-4 mx-4" />
          <SectionHeader title="Account" />
          <NavButton icon={User} label="My Profile" path="/profile" />
          {profile?.role === 'admin' && (
            <NavButton icon={UserPlus} label="Manage Users" path="/admin/users" />
          )}
          <NavButton icon={Settings} label="Settings" path="/settings" />
          
          {/* Sign Out */}
          <div className="px-2 pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors min-h-[44px] text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
