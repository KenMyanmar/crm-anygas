
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, TrendingUp, DollarSign, Package, MapPin } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface OrdersData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  monthlyTrends: any[];
  ordersByStatus: any[];
  topTownships: any[];
  recentOrders: any[];
}

const OrdersSalesReportPage = () => {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchOrdersData();
  }, [timeRange]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with restaurant data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
          total_amount_kyats,
          status,
          restaurants (
            name,
            township
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;

      // Process data
      const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount_kyats) || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Orders by status
      const statusCounts = orders?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count,
        percentage: totalOrders > 0 ? ((count as number) / totalOrders * 100).toFixed(1) : 0
      }));

      // Top townships by revenue
      const townshipRevenue = orders?.reduce((acc: any, order) => {
        const township = order.restaurants?.township || 'Unknown';
        if (!acc[township]) {
          acc[township] = { revenue: 0, orders: 0 };
        }
        acc[township].revenue += Number(order.total_amount_kyats) || 0;
        acc[township].orders += 1;
        return acc;
      }, {}) || {};

      const topTownships = Object.entries(townshipRevenue)
        .map(([township, data]: [string, any]) => ({
          township,
          revenue: data.revenue,
          orders: data.orders,
          avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Monthly trends (mock data for now)
      const monthlyTrends = [
        { month: 'Jan', revenue: 180000, orders: 12 },
        { month: 'Feb', revenue: 220000, orders: 15 },
        { month: 'Mar', revenue: 280000, orders: 18 },
        { month: 'Apr', revenue: 320000, orders: 22 },
        { month: 'May', revenue: 380000, orders: 25 },
        { month: 'Jun', revenue: totalRevenue, orders: totalOrders }
      ];

      setData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        monthlyTrends,
        ordersByStatus,
        topTownships,
        recentOrders: orders?.slice(0, 5) || []
      });

    } catch (error: any) {
      console.error('Error fetching orders data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
  };

  const statusColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders & Sales Report</h1>
          <p className="text-muted-foreground">Revenue analytics and sales performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
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
                <p className="text-2xl font-bold">{data.totalOrders}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(data.avgOrderValue)}</p>
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
                <p className="text-2xl font-bold">{data.topTownships.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Current order status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                  >
                    {data.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Townships */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Townships</CardTitle>
          <CardDescription>Revenue and order performance by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topTownships.map((township, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{township.township}</p>
                    <p className="text-sm text-muted-foreground">{township.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(township.revenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(township.avgOrderValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSalesReportPage;
