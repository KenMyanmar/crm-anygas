
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavigationDropdown from './NavigationDropdown';
import { 
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
  Truck,
  Route,
  Activity,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MainNavigation = () => {
  const { profile } = useAuth();
  const location = useLocation();
  
  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';

  // Fixed isActive function to prevent navigation loops
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const restaurantItems = [
    { label: 'All Restaurants', icon: Search, path: '/restaurants' },
    { label: 'New Restaurant', icon: Plus, path: '/restaurants/new' }
  ];

  const leadItems = [
    { label: 'All Leads', icon: FileText, path: '/leads' },
    { label: 'Assigned to Me', icon: User, path: '/leads/assigned' },
    { label: 'Meetings', icon: CalendarDays, path: '/leads/meetings' }
  ];

  const visitItems = [
    { label: 'Visit Planner', icon: Calendar, path: '/visits' },
    { label: "Today's Visits", icon: MapPin, path: '/visits/today' }
  ];

  const ucoItems = [
    { label: 'UCO Dashboard', icon: Truck, path: '/uco/dashboard' },
    { label: 'Collection Plans', icon: Calendar, path: '/uco/planner' },
    { label: 'Route Optimizer', icon: Route, path: '/uco/routes' },
    { label: 'Restaurant Leads', icon: Building2, path: '/uco/restaurant-leads' },
    { label: 'Driver Interface', icon: MapPin, path: '/uco/mobile' },
    { label: 'UCO Analytics', icon: Activity, path: '/uco/analytics' }
  ];

  const orderItems = [
    { label: 'Order Management', icon: ShoppingCart, path: '/orders' },
    { label: 'Create Order', icon: Plus, path: '/orders/new' }
  ];

  const reportItems = [
    { label: 'Sales Reports', icon: BarChart, path: '/reports' },
    { label: 'Performance', icon: BarChart, path: '/reports/performance' }
  ];

  const adminItems = [
    ...(profile?.role === 'admin' ? [{ label: 'Users', icon: Users, path: '/admin/users' }] : []),
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Restaurant Management', icon: Building2, path: '/admin/restaurants' }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {/* Dashboard */}
      <Link
        to="/"
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive("/")
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <Home className="h-4 w-4 mr-2" />
        Dashboard
      </Link>

      {/* Navigation Dropdowns */}
      <NavigationDropdown 
        label="Restaurants" 
        icon={Users} 
        items={restaurantItems} 
        basePath="/restaurants" 
      />
      
      <NavigationDropdown 
        label="Leads" 
        icon={FileText} 
        items={leadItems} 
        basePath="/leads" 
      />
      
      <NavigationDropdown 
        label="Visits" 
        icon={MapPin} 
        items={visitItems} 
        basePath="/visits" 
      />

      <NavigationDropdown 
        label="UCO Trucks" 
        icon={Truck} 
        items={ucoItems} 
        basePath="/uco" 
      />
      
      <NavigationDropdown 
        label="Orders" 
        icon={ShoppingCart} 
        items={orderItems} 
        basePath="/orders" 
      />
      
      <NavigationDropdown 
        label="Reports" 
        icon={BarChart} 
        items={reportItems} 
        basePath="/reports" 
      />

      {/* Admin */}
      {isAdminOrManager && (
        <NavigationDropdown 
          label="Admin" 
          icon={Settings} 
          items={adminItems} 
          basePath="/admin" 
        />
      )}
    </nav>
  );
};

export default MainNavigation;
