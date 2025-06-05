
import React, { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import AIChatWidget from './AIChatWidget';
import MyanmarBusinessInsights from './MyanmarBusinessInsights';

interface DashboardWithAIProps {
  children: React.ReactNode;
  userRole?: string;
}

const DashboardWithAI: React.FC<DashboardWithAIProps> = ({ children, userRole }) => {
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const { dashboardData } = useDashboardData();

  return (
    <div className="relative">
      {/* Original Dashboard Content */}
      {children}
      
      {/* Myanmar Business Insights Sidebar */}
      <div className="fixed top-20 left-4 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-10">
        <MyanmarBusinessInsights 
          dashboardData={dashboardData}
          className="space-y-4"
        />
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget
        dashboardData={dashboardData}
        userRole={userRole}
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />
    </div>
  );
};

export default DashboardWithAI;
