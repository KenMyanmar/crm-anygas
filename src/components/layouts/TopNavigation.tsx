
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
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
  UserPlus
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
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {/* Dashboard */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActive("/") && location.pathname === "/" && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Restaurants */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive("/restaurants") ? "bg-accent text-accent-foreground" : ""}>
                  <Users className="h-4 w-4 mr-2" />
                  Restaurants
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/restaurants" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">All Restaurants</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View and manage all restaurant partners
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/restaurants/new" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">New Restaurant</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Add a new restaurant partner
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Leads */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive("/leads") ? "bg-accent text-accent-foreground" : ""}>
                  <FileText className="h-4 w-4 mr-2" />
                  Leads
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/leads" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">All Leads</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/leads/assigned" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Assigned to Me</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/leads/meetings" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Meetings</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Visits */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive("/visits") ? "bg-accent text-accent-foreground" : ""}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Visits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/visits" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Visit Planner</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/visits/today" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Today's Visits</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Orders */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive("/orders") ? "bg-accent text-accent-foreground" : ""}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Orders
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/orders" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Order Management</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/orders/new" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Create Order</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Reports */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive("/reports") ? "bg-accent text-accent-foreground" : ""}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/reports" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Sales Reports</div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/reports/performance" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Performance</div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Admin */}
              {isAdminOrManager && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={isActive("/admin") ? "bg-accent text-accent-foreground" : ""}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {profile?.role === 'admin' && (
                        <NavigationMenuLink asChild>
                          <Link to="/admin/users" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <div className="text-sm font-medium leading-none">Users</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      )}
                      <NavigationMenuLink asChild>
                        <Link to="/admin/products" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            <div className="text-sm font-medium leading-none">Products</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

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
