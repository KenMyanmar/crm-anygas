
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

const DashboardError = ({ error, onRetry }: DashboardErrorProps) => {
  return (
    <Card className="border-red-200">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex items-center justify-center text-red-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-muted-foreground mb-4">
            We couldn't load your dashboard data. This might be due to a network issue or a problem with the data source.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardError;
