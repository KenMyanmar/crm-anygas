
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Truck, Package, TrendingUp } from 'lucide-react';

interface OrderDashboardStatsProps {
  stats: {
    pendingCount: number;
    confirmedCount: number;
    inDeliveryCount: number;
    deliveredCount: number;
    totalRevenue: number;
  };
}

const OrderDashboardStats = ({ stats }: OrderDashboardStatsProps) => {
  const statCards = [
    {
      title: 'Pending Approval',
      value: stats.pendingCount,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      urgent: stats.pendingCount > 0
    },
    {
      title: 'Confirmed',
      value: stats.confirmedCount,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'In Delivery',
      value: stats.inDeliveryCount,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Delivered Today',
      value: stats.deliveredCount,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className={`${stat.bgColor} ${stat.borderColor} border-2 ${stat.urgent ? 'ring-2 ring-amber-200' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.urgent && (
                    <p className="text-xs text-amber-600 font-medium mt-1">Needs attention</p>
                  )}
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDashboardStats;
