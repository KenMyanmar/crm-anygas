
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, TrendingUp, Package } from 'lucide-react';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';

interface DeliveredOrdersStatsProps {
  orders: DeliveredOrder[];
}

const DeliveredOrdersStats = ({ orders }: DeliveredOrdersStatsProps) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount_kyats, 0);
  
  const onTimeDeliveries = orders.filter(order => {
    const scheduled = new Date(order.delivery_date_scheduled);
    const actual = new Date(order.delivery_date_actual);
    return actual <= scheduled;
  }).length;
  
  const onTimePercentage = totalOrders > 0 ? Math.round((onTimeDeliveries / totalOrders) * 100) : 0;
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Delivered</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            Orders successfully delivered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            From delivered orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onTimePercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {onTimeDeliveries} of {totalOrders} on time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <Package className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
          <p className="text-xs text-muted-foreground">
            Average per order
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveredOrdersStats;
