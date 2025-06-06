
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, MapPin } from 'lucide-react';

interface OrdersMetricsCardsProps {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  activeTownships: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
};

export const OrdersMetricsCards = ({
  totalRevenue,
  totalOrders,
  avgOrderValue,
  activeTownships
}: OrdersMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Townships</p>
              <p className="text-2xl font-bold">{activeTownships}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
