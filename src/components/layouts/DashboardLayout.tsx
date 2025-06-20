
import { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import NavMenu from './NavMenu';
import Header from './Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayoutContent = ({ children }: DashboardLayoutProps) => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const sidebar = useSidebar();
  
  // React Strict Mode guard for effects
  const hasInitializedNotifications = useRef(false);
  const hasInitializedAuth = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Prevent double mounting in React Strict Mode
    if (hasInitializedAuth.current) return;
    hasInitializedAuth.current = true;

    if (!isLoading && !profile) {
      navigate('/login');
    }

    return () => {
      hasInitializedAuth.current = false;
    };
  }, [profile, isLoading, navigate]);

  // Mock data for unread notifications count
  useEffect(() => {
    // Prevent double mounting in React Strict Mode
    if (hasInitializedNotifications.current) return;
    hasInitializedNotifications.current = true;

    // In production, this would fetch from the database
    setUnreadNotifications(3);

    return () => {
      hasInitializedNotifications.current = false;
    };
  }, []);

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

  return (
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        className={cn(
          "transition-all duration-300 border-r shadow-sm",
          sidebar.state === "expanded" ? "w-64" : 
          sidebar.state === "collapsed" ? "w-16" : "w-0"
        )}
        collapsible="icon"
      >
        <div className="h-16 border-b flex items-center px-3">
          <div className="flex-1 overflow-hidden">
            {sidebar.state !== "collapsed" && (
              <div className="font-semibold text-lg truncate flex items-center">
                <svg className="h-6 w-6 text-yellow-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L4 9V21H20V9L12 3Z" />
                </svg>
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
        <Header unreadNotifications={unreadNotifications} />
        
        <main className="flex-1 overflow-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
