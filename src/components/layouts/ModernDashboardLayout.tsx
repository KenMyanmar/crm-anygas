
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TopNavigation from './TopNavigation';
import ModernAIChatPanel from '../dashboard/ModernAIChatPanel';
import { useDashboardData } from '@/hooks/useDashboardData';

interface ModernDashboardLayoutProps {
  children: ReactNode;
}

const ModernDashboardLayout = ({ children }: ModernDashboardLayoutProps) => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { dashboardData } = useDashboardData();

  // Redirect to login if not authenticated
  if (!isLoading && !profile) {
    navigate('/login');
    return null;
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavigation />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {children}
      </main>

      <ModernAIChatPanel
        dashboardData={dashboardData}
        userRole={profile.role}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
};

export default ModernDashboardLayout;
