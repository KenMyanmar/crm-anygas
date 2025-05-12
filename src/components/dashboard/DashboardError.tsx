
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

const DashboardError = ({ error, onRetry }: DashboardErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="text-red-500 mb-4">{error}</div>
      <Button 
        variant="outline" 
        onClick={onRetry}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" /> 
        Try Again
      </Button>
    </div>
  );
};

export default DashboardError;
