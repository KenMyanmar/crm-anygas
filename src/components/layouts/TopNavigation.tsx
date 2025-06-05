
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Home, 
  Users, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  BarChart, 
  Settings,
  Bell,
  LogOut,
  User,
  MapPin,
  Plus,
  Search,
  CalendarDays,
  Package,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TopNavigation = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications] = useState(3);
  
  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L4 9V21H20V9L12 3Z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-primary">ANY GAS Myanmar</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Dashboard */}
            <Link
              to="/"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/") && location.pathname === "/" 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            {/* Restaurants */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive("/restaurants") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Restaurants
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                <DropdownMenuItem onClick={() => navigate('/restaurants')}>
                  <Search className="h-4 w-4 mr-2" />
                  All Restaurants
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/restaurants/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Restaurant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Leads */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive("/leads") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Leads
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                <DropdownMenuItem onClick={() => navigate('/leads')}>
                  <FileText className="h-4 w-4 mr-2" />
                  All Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/leads/assigned')}>
                  <User className="h-4 w-4 mr-2" />
                  Assigned to Me
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/leads/meetings')}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Meetings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Visits */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive("/visits") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Visits
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                <DropdownMenuItem onClick={() => navigate('/visits')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Visit Planner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/visits/today')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Today's Visits
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Orders */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive("/orders") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Orders
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                <DropdownMenuItem onClick={() => navigate('/orders')}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reports */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive("/reports") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                <DropdownMenuItem onClick={() => navigate('/reports')}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Sales Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/reports/performance')}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Performance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin */}
            {isAdminOrManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive("/admin") 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-50">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                    <Package className="h-4 w-4 mr-2" />
                    Products
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/notifications')} 
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
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
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 z-50">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-medium text-sm">{profile?.full_name}</span>
                    <span className="text-xs text-muted-foreground">{profile?.email}</span>
                  </div>
                </DropdownMenuLabel>
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
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
