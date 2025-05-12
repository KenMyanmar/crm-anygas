
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader = ({ onRefresh }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  );
};

export default DashboardHeader;
