
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
  Bell
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
  
  // More precise active state detection
  const isActive = end 
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  // Build class names conditionally
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
  const isAdmin = profile?.role === 'admin';
  
  // Control open states manually instead of using defaultOpen
  const [leadsGroupOpen, setLeadsGroupOpen] = useState(false);
  const [ordersGroupOpen, setOrdersGroupOpen] = useState(false);
  const [reportsGroupOpen, setReportsGroupOpen] = useState(false);
  const [adminGroupOpen, setAdminGroupOpen] = useState(false);
  
  // Determine which group should be expanded based on current route
  useEffect(() => {
    const isLeadsActive = location.pathname.includes('/leads');
    const isOrdersActive = location.pathname.includes('/orders');
    const isReportsActive = location.pathname.includes('/reports');
    const isSettingsActive = location.pathname.includes('/admin');
    
    setLeadsGroupOpen(isLeadsActive);
    setOrdersGroupOpen(isOrdersActive);
    setReportsGroupOpen(isReportsActive);
    setAdminGroupOpen(isSettingsActive);
  }, [location.pathname]);

  return (
    <div className="space-y-1">
      <SidebarGroup>
        <SidebarMenu>
          <MenuLink to="/" icon={Home} label="Dashboard" end={true} />
          <MenuLink to="/notifications" icon={Bell} label="Notifications" />
          <MenuLink to="/restaurants" icon={Search} label="Restaurants" />
        </SidebarMenu>
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
        <div onClick={() => setOrdersGroupOpen(!ordersGroupOpen)} className="cursor-pointer">
          <SidebarGroupLabel>Orders</SidebarGroupLabel>
        </div>
        {ordersGroupOpen && (
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuLink to="/orders" icon={Package} label="All Orders" />
              <MenuLink to="/orders/pending" icon={Package} label="Pending Orders" />
              <MenuLink to="/orders/delivered" icon={Package} label="Delivered Orders" />
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
      
      {isAdmin && (
        <SidebarGroup>
          <div onClick={() => setAdminGroupOpen(!adminGroupOpen)} className="cursor-pointer">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
          </div>
          {adminGroupOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuLink to="/admin/users" icon={Users} label="Users" />
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
