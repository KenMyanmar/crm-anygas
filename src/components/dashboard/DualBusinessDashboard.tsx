
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Droplets, TrendingUp, Users, MapPin, DollarSign, Star } from 'lucide-react';
import { useDualBusinessAnalytics } from '@/hooks/useDualBusinessAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, trend, icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DualBusinessDashboard: React.FC = () => {
  const { data: metrics, isLoading } = useDualBusinessAnalytics('30');

  if (isLoading) {
    return <div>Loading dual business analytics...</div>;
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Strategic Overview */}
      <div className="flex items-center space-x-2 mb-6">
        <Flame className="h-6 w-6 text-orange-500" />
        <Droplets className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Dual Business Performance</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Route Efficiency"
          value={`${metrics.visitEfficiency.toFixed(1)}%`}
          description="Combined visits vs separate trips"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Cross-Selling Success"
          value={`${metrics.crossSellRate.toFixed(1)}%`}
          description="UCO suppliers who became gas customers"
          icon={<Users className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Combined CLV"
          value={`${(metrics.avgCLV / 1000).toFixed(0)}K`}
          description="Gas + UCO revenue per customer"
          icon={<DollarSign className="h-5 w-5 text-white" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Visit Balance"
          value={`${metrics.combinedVisits}/${metrics.separateVisits}`}
          description="Combined vs separate visits"
          icon={<MapPin className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Business Line Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gas Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span>Gas Business Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {(metrics.gas.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue (MMK)</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.gas.avgSaleSize.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Sale Size (MMK)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{metrics.gas.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{metrics.gas.activeCustomers}</p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UCO Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span>UCO Collection Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.uco.totalCollection.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Total Collection (Kg)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.uco.avgPricePerKg.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Price/Kg (MMK)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  <p className="text-2xl font-bold">{metrics.uco.qualityAverage.toFixed(1)}</p>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Avg Quality Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{metrics.uco.activeSuppliers}</p>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Myanmar Market Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Myanmar Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Operational Synergy</h4>
              <p className="text-sm text-muted-foreground">
                Single route serving both gas sales and UCO collection maximizes efficiency
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg">
              <h4 className="font-semibold mb-2">Market Leadership</h4>
              <p className="text-sm text-muted-foreground">
                Pioneer position in dual-business approach creates competitive advantage
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold mb-2">Relationship Building</h4>
              <p className="text-sm text-muted-foreground">
                Multiple touchpoints strengthen customer relationships and loyalty
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
