
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
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
  Users 
} from 'lucide-react';

interface MenuLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const MenuLink: FC<MenuLinkProps> = ({ to, icon: Icon, label }) => {
  const sidebar = useSidebar();
  
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

const NavMenu: FC = () => {
  const { profile } = useAuth();
  const sidebar = useSidebar();
  const isAdmin = profile?.role === 'admin';

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

export default NavMenu;
