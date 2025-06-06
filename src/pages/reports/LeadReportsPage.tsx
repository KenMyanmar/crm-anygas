
import { useState } from 'react';
import { useLeadAnalytics } from '@/hooks/useLeadAnalytics';
import { LeadAnalyticsHeader } from '@/components/reports/LeadAnalyticsHeader';
import { LeadAnalyticsSkeleton } from '@/components/reports/LeadAnalyticsSkeleton';
import { LeadMetricsCards } from '@/components/reports/LeadMetricsCards';
import { LeadPipelineFunnel } from '@/components/reports/LeadPipelineFunnel';
import { LeadConversionCharts } from '@/components/reports/LeadConversionCharts';
import { SalespersonPerformance } from '@/components/reports/SalespersonPerformance';
import { LeadTrendsCharts } from '@/components/reports/LeadTrendsCharts';
import { LeadActivityTable } from '@/components/reports/LeadActivityTable';

const LeadReportsPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const { data, loading } = useLeadAnalytics(timeRange);

  if (loading) {
    return <LeadAnalyticsSkeleton />;
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8">
      <LeadAnalyticsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      
      <LeadMetricsCards
        totalLeads={data.totalLeads}
        conversionRate={data.conversionRate}
        avgDealValue={data.avgDealValue}
        pipelineVelocity={data.pipelineVelocity}
      />

      <LeadPipelineFunnel conversionFunnel={data.conversionFunnel} />

      <LeadConversionCharts
        leadsByStatus={data.leadsByStatus}
        leadsBySource={data.leadsBySource}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalespersonPerformance performanceBySalesperson={data.performanceBySalesperson} />
        <LeadActivityTable recentActivity={data.recentActivity} />
      </div>

      <LeadTrendsCharts
        trendData={data.trendData}
        leadsByTownship={data.leadsByTownship}
      />
    </div>
  );
};

export default LeadReportsPage;
