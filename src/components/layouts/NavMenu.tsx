import { FC, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { 
  BarChart, 
  FileText, 
  Home, 
  Package, 
  Search, 
  Settings, 
  Users,
  Clipboard,
  CalendarDays,
  Bell,
  Plus,
  MapPin,
  Route,
  Calendar,
  ShoppingCart,
  Truck,
  Map,
  Activity
} from 'lucide-react';

interface MenuLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  end?: boolean;
}

const MenuLink: FC<MenuLinkProps> = ({ to, icon: Icon, label, end = false }) => {
  const sidebar = useSidebar();
  const location = useLocation();
  
  const isActive = end 
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  const baseClasses = "flex items-center py-2 px-3 rounded-md transition-colors";
  const activeClasses = "bg-primary/10 text-primary font-medium border-l-2 border-primary";
  const inactiveClasses = "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  
  const combinedClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink to={to} className={combinedClasses} end={end}>
          <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
          {!sidebar.state.includes("collapsed") && <span>{label}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavMenu: FC = () => {
  const { profile } = useAuth();
  const sidebar = useSidebar();
  const location = useLocation();
  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';
  
  const [leadsGroupOpen, setLeadsGroupOpen] = useState(false);
  const [ordersGroupOpen, setOrdersGroupOpen] = useState(false);
  const [visitsGroupOpen, setVisitsGroupOpen] = useState(false);
  const [ucoGroupOpen, setUcoGroupOpen] = useState(false);
  const [reportsGroupOpen, setReportsGroupOpen] = useState(false);
  const [adminGroupOpen, setAdminGroupOpen] = useState(false);
  const [restaurantsGroupOpen, setRestaurantsGroupOpen] = useState(false);
  
  useEffect(() => {
    const isLeadsActive = location.pathname.includes('/leads');
    const isOrdersActive = location.pathname.includes('/orders');
    const isVisitsActive = location.pathname.includes('/visits');
    const isUcoActive = location.pathname.includes('/uco');
    const isReportsActive = location.pathname.includes('/reports');
    const isSettingsActive = location.pathname.includes('/admin');
    const isRestaurantsActive = location.pathname.includes('/restaurants');
    
    setLeadsGroupOpen(isLeadsActive);
    setOrdersGroupOpen(isOrdersActive);
    setVisitsGroupOpen(isVisitsActive);
    setUcoGroupOpen(isUcoActive);
    setReportsGroupOpen(isReportsActive);
    setAdminGroupOpen(isSettingsActive);
    setRestaurantsGroupOpen(isRestaurantsActive);
  }, [location.pathname]);

  return (
    <div className="space-y-1">
      <SidebarGroup>
        <SidebarMenu>
          <MenuLink to="/" icon={Home} label="Dashboard" end={true} />
          <MenuLink to="/notifications" icon={Bell} label="Notifications" />
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <div onClick={() => setRestaurantsGroupOpen(!restaurantsGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Restaurants</SidebarGroupLabel>
        </div>
        {restaurantsGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/restaurants" icon={Search} label="All Restaurants" />
              <MenuLink to="/restaurants/new" icon={Plus} label="New Restaurant" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
      
      <SidebarGroup>
        <div onClick={() => setLeadsGroupOpen(!leadsGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Leads</SidebarGroupLabel>
        </div>
        {leadsGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/leads" icon={FileText} label="All Leads" />
              <MenuLink to="/leads/assigned" icon={Clipboard} label="Assigned to Me" />
              <MenuLink to="/leads/meetings" icon={CalendarDays} label="Meetings" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>

      <SidebarGroup>
        <div onClick={() => setVisitsGroupOpen(!visitsGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Visits</SidebarGroupLabel>
        </div>
        {visitsGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/visits" icon={Calendar} label="Visit Planner" />
              <MenuLink to="/visits/today" icon={MapPin} label="Today's Visits" />
              <MenuLink to="/visits/new" icon={Plus} label="New Visit Plan" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
      
      <SidebarGroup>
        <div onClick={() => setUcoGroupOpen(!ucoGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>UCO Trucks Visit</SidebarGroupLabel>
        </div>
        {ucoGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/uco/dashboard" icon={Truck} label="UCO Dashboard" />
              <MenuLink to="/uco/planner" icon={Calendar} label="Collection Plans" />
              <MenuLink to="/uco/routes" icon={Route} label="Route Optimizer" />
              <MenuLink to="/uco/mobile" icon={MapPin} label="Driver Interface" />
              <MenuLink to="/uco/analytics" icon={Activity} label="UCO Analytics" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
      
      <SidebarGroup>
        <div onClick={() => setOrdersGroupOpen(!ordersGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Orders</SidebarGroupLabel>
        </div>
        {ordersGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/orders" icon={ShoppingCart} label="Order Management" />
              <MenuLink to="/orders/new" icon={Plus} label="Create Order" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
      
      <SidebarGroup>
        <div onClick={() => setReportsGroupOpen(!reportsGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
        </div>
        {reportsGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/reports" icon={BarChart} label="Sales Reports" />
              <MenuLink to="/reports/leads" icon={BarChart} label="Lead Reports" />
              <MenuLink to="/reports/performance" icon={BarChart} label="Performance" />
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
      
      {isAdminOrManager && (
        <SidebarGroup>
          <div onClick={() => setAdminGroupOpen(!adminGroupOpen)} className="cursor-pointer">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
          </div>
          {adminGroupOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {profile?.role === 'admin' && (
                  <MenuLink to="/admin/users" icon={Users} label="Users" />
                )}
                <MenuLink to="/admin/products" icon={Package} label="Products" />
                <MenuLink to="/admin/import" icon={FileText} label="Import Data" />
                <MenuLink to="/admin/settings" icon={Settings} label="Settings" />
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      )}
    </div>
  );
};

export default NavMenu;
