
import { useState } from 'react';
import { useOrdersSalesData } from '@/hooks/useOrdersSalesData';
import { OrdersReportHeader } from '@/components/reports/OrdersReportHeader';
import { OrdersReportSkeleton } from '@/components/reports/OrdersReportSkeleton';
import { OrdersMetricsCards } from '@/components/reports/OrdersMetricsCards';
import { OrdersCharts } from '@/components/reports/OrdersCharts';
import { TopTownshipsTable } from '@/components/reports/TopTownshipsTable';

const OrdersSalesReportPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const { data, loading } = useOrdersSalesData(timeRange);

  if (loading) {
    return <OrdersReportSkeleton />;
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8">
      <OrdersReportHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      
      <OrdersMetricsCards
        totalRevenue={data.totalRevenue}
        totalOrders={data.totalOrders}
        avgOrderValue={data.avgOrderValue}
        activeTownships={data.topTownships.length}
      />

      <OrdersCharts
        monthlyTrends={data.monthlyTrends}
        ordersByStatus={data.ordersByStatus}
      />

      <TopTownshipsTable topTownships={data.topTownships} />
    </div>
  );
};

export default OrdersSalesReportPage;
