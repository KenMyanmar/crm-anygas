
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  Users,
  Phone,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  Calendar,
  CheckSquare,
  Bell,
  Truck
} from 'lucide-react';

const NavMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      title: 'Calendar',
      href: '/calendar',
      icon: Calendar,
    },
    {
      title: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
    },
    {
      title: 'Restaurants',
      href: '/restaurants',
      icon: Users,
    },
    {
      title: 'Leads',
      href: '/leads',
      icon: Phone,
      children: [
        { title: 'All Leads', href: '/leads' },
        { title: 'Assigned to Me', href: '/leads/assigned' },
        { title: 'Meetings', href: '/leads/meetings' },
        { title: 'Calls', href: '/leads/calls' },
      ],
    },
    {
      title: 'Orders',
      href: '/orders',
      icon: Package,
      children: [
        { title: 'All Orders', href: '/orders' },
        { title: 'Pending', href: '/orders/pending' },
        { title: 'Approved', href: '/orders/approved' },
        { title: 'Delivered', href: '/orders/delivered' },
      ],
    },
    {
      title: 'Visits',
      href: '/visits',
      icon: ClipboardList,
      children: [
        { title: 'Today\'s Visits', href: '/visits/today' },
        { title: 'Visit Planner', href: '/visits/planner' },
        { title: 'Dual Business', href: '/visits/dual-business' },
      ],
    },
    {
      title: 'UCO Collection',
      href: '/uco',
      icon: Truck,
      children: [
        { title: 'Dashboard', href: '/uco/dashboard' },
        { title: 'Collection Planner', href: '/uco/planner' },
        { title: 'Route Optimizer', href: '/uco/routes' },
        { title: 'Mobile Interface', href: '/uco/mobile' },
        { title: 'Analytics', href: '/uco/analytics' },
      ],
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: BarChart3,
      children: [
        { title: 'Overview', href: '/reports' },
        { title: 'Leads Analysis', href: '/reports/leads' },
        { title: 'Sales Performance', href: '/reports/performance' },
        { title: 'Orders & Sales', href: '/reports/orders-sales' },
        { title: 'Visits Report', href: '/reports/visits' },
        { title: 'Restaurants Report', href: '/reports/restaurants' },
      ],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1 p-2">
      {menuItems.map((item) => {
        const isActive = isActiveLink(item.href);
        const Icon = item.icon;

        return (
          <div key={item.href}>
            <Link
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.title}
            </Link>
            {item.children && isActive && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className={cn(
                      'block px-3 py-1 text-xs rounded-md transition-colors',
                      location.pathname === child.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavMenu;
