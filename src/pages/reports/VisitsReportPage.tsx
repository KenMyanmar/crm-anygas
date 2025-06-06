
import { useState } from 'react';
import { useVisitsReportData } from '@/hooks/useVisitsReportData';
import { VisitsReportHeader } from '@/components/reports/VisitsReportHeader';
import { VisitsReportSkeleton } from '@/components/reports/VisitsReportSkeleton';
import { VisitsMetricsCards } from '@/components/reports/VisitsMetricsCards';
import { VisitsCharts } from '@/components/reports/VisitsCharts';
import { VisitsTownshipsTable } from '@/components/reports/VisitsTownshipsTable';
import { RecentVisitsTable } from '@/components/reports/RecentVisitsTable';

const VisitsReportPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const { data, loading } = useVisitsReportData(timeRange);

  if (loading) {
    return <VisitsReportSkeleton />;
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8">
      <VisitsReportHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      
      <VisitsMetricsCards
        totalVisits={data.totalVisits}
        completionRate={data.completionRate}
        avgDuration={data.avgDuration}
        plannedVisits={data.plannedVisits}
      />

      <VisitsCharts
        dailyVisits={data.dailyVisits}
        visitsByStatus={data.visitsByStatus}
      />

      <VisitsTownshipsTable visitsByTownship={data.visitsByTownship} />

      <RecentVisitsTable recentVisits={data.recentVisits} />
    </div>
  );
};

export default VisitsReportPage;
