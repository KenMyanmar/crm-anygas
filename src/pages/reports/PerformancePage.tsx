
import { useState } from 'react';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { PerformanceReportHeader } from '@/components/reports/PerformanceReportHeader';
import { PerformanceSkeleton } from '@/components/reports/PerformanceSkeleton';
import { PerformanceMetricsCards } from '@/components/reports/PerformanceMetricsCards';
import { SalespersonProfileCards } from '@/components/reports/SalespersonProfileCards';
import { ActivityHeatmap } from '@/components/reports/ActivityHeatmap';
import { VisitEfficiencyCharts } from '@/components/reports/VisitEfficiencyCharts';
import { GoalTrackingSection } from '@/components/reports/GoalTrackingSection';

const PerformancePage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const { data, loading } = usePerformanceAnalytics(timeRange);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PerformanceSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No performance data available</h2>
          <p className="text-muted-foreground">Unable to load performance analytics at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PerformanceReportHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      
      <PerformanceMetricsCards metrics={data.metrics} />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Individual Performance Profiles</h2>
          <SalespersonProfileCards profiles={data.salespersonProfiles} />
        </div>

        <ActivityHeatmap activityPatterns={data.activityPatterns} />

        <VisitEfficiencyCharts visitEfficiency={data.visitEfficiency} />

        <GoalTrackingSection goalTracking={data.goalTracking} />
      </div>
    </div>
  );
};

export default PerformancePage;
