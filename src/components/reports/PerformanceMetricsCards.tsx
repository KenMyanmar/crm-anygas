
import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, MapPin, TrendingUp, Target, DollarSign, BarChart, Clock } from 'lucide-react';
import { PerformanceMetrics } from '@/hooks/usePerformanceAnalytics';

interface PerformanceMetricsCardsProps {
  metrics: PerformanceMetrics;
}

export const PerformanceMetricsCards = ({ metrics }: PerformanceMetricsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Salespeople</p>
              <p className="text-2xl font-bold">{metrics.totalSalespeople}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Login Frequency</p>
              <p className="text-2xl font-bold">{metrics.avgLoginFrequency.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Visit Plans Created</p>
              <p className="text-2xl font-bold">{metrics.totalVisitPlans}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Visits Completed</p>
              <p className="text-2xl font-bold">{metrics.totalVisitsCompleted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-muted-foreground">Leads Generated</p>
              <p className="text-2xl font-bold">{metrics.totalLeadsGenerated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <BarChart className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Orders Created</p>
              <p className="text-2xl font-bold">{metrics.totalOrdersCreated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-700" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)} K</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
