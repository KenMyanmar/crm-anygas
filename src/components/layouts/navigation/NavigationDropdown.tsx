
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavigationDropdownProps {
  label: string;
  icon: LucideIcon;
  items: DropdownItem[];
  basePath: string;
}

const NavigationDropdown = ({ label, icon: Icon, items, basePath }: NavigationDropdownProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive(basePath) 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        sideOffset={8} 
        className="w-56 z-50 bg-popover border shadow-lg rounded-md"
      >
        {items.map((item) => (
          <DropdownMenuItem 
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
          >
            <item.icon className="h-4 w-4 mr-3 text-muted-foreground" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationDropdown;
