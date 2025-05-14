
import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import NavMenu from './NavMenu';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const sidebar = useSidebar();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !profile) {
      navigate('/login');
    }
  }, [profile, isLoading, navigate]);

  // Mock data for unread notifications count
  useEffect(() => {
    // In production, this would fetch from the database
    setUnreadNotifications(3);
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
    <div className="min-h-screen flex w-full">
      <Sidebar className="transition-all duration-300" collapsible="icon">
        <div className="h-16 border-b flex items-center px-3">
          <div className="flex-1 overflow-hidden">
            {sidebar.state !== "collapsed" && (
              <div className="font-semibold text-lg truncate">
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
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
