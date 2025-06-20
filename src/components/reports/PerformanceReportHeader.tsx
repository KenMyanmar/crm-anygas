
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart, Users } from 'lucide-react';

interface PerformanceReportHeaderProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export const PerformanceReportHeader = ({ timeRange, onTimeRangeChange }: PerformanceReportHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-3">
        <BarChart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Performance Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics on sales team performance and goal achievement</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};
