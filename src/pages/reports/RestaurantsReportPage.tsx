
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, TrendingUp, MapPin, Users, Download, Calendar } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';

interface RestaurantsData {
  totalRestaurants: number;
  newThisMonth: number;
  activeRestaurants: number;
  restaurantsByTownship: any[];
  monthlyGrowth: any[];
  recentAdditions: any[];
  engagementLevels: any[];
}

const RestaurantsReportPage = () => {
  const [data, setData] = useState<RestaurantsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchRestaurantsData();
  }, [timeRange]);

  const fetchRestaurantsData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurants data
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          township,
          created_at,
          salesperson_id,
          users (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalRestaurants = restaurants?.length || 0;
      
      // New restaurants this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = restaurants?.filter(r => 
        new Date(r.created_at) >= thisMonth
      ).length || 0;

      // Restaurants by township
      const townshipCounts = restaurants?.reduce((acc: any, restaurant) => {
        const township = restaurant.township || 'Unknown';
        acc[township] = (acc[township] || 0) + 1;
        return acc;
      }, {}) || {};

      const restaurantsByTownship = Object.entries(townshipCounts)
        .map(([township, count]) => ({
          township,
          count: Number(count),
          percentage: totalRestaurants > 0 ? ((Number(count)) / totalRestaurants * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Monthly growth (mock data for demonstration)
      const monthlyGrowth = [
        { month: 'Jan', total: 850, new: 45 },
        { month: 'Feb', total: 880, new: 30 },
        { month: 'Mar', total: 920, new: 40 },
        { month: 'Apr', total: 960, new: 40 },
        { month: 'May', total: 980, new: 20 },
        { month: 'Jun', total: totalRestaurants, new: newThisMonth }
      ];

      // Engagement levels (based on orders and visits)
      const engagementLevels = [
        { level: 'High Engagement', count: 120, description: '5+ orders or visits' },
        { level: 'Medium Engagement', count: 380, description: '2-4 orders or visits' },
        { level: 'Low Engagement', count: 450, description: '1 order or visit' },
        { level: 'No Engagement', count: 50, description: 'No recent activity' }
      ];

      setData({
        totalRestaurants,
        newThisMonth,
        activeRestaurants: totalRestaurants - 50, // mock active count
        restaurantsByTownship,
        monthlyGrowth,
        recentAdditions: restaurants?.slice(0, 10) || [],
        engagementLevels
      });

    } catch (error: any) {
      console.error('Error fetching restaurants data:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    total: {
      label: "Total Restaurants",
      color: "hsl(var(--chart-1))",
    },
    new: {
      label: "New Restaurants",
      color: "hsl(var(--chart-2))",
    },
  };

  const engagementColors = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042'];

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
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Growth Report</h1>
          <p className="text-muted-foreground">New restaurant acquisition and market expansion tracking</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Restaurants</p>
                <p className="text-2xl font-bold">{data.totalRestaurants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{data.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Restaurants</p>
                <p className="text-2xl font-bold">{data.activeRestaurants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Townships Covered</p>
                <p className="text-2xl font-bold">{data.restaurantsByTownship.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth Trends</CardTitle>
            <CardDescription>Restaurant acquisition and total count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} name="Total" />
                  <Bar dataKey="new" fill="var(--color-new)" name="New" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Engagement Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Engagement Levels</CardTitle>
            <CardDescription>Activity levels based on orders and visits</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.engagementLevels}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ level, count }) => `${level}: ${count}`}
                  >
                    {data.engagementLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={engagementColors[index % engagementColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Township Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Distribution by Township</CardTitle>
          <CardDescription>Geographic spread of restaurant network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.restaurantsByTownship.map((township, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{township.township}</p>
                    <p className="text-sm text-muted-foreground">{township.count} restaurants</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{township.percentage}%</p>
                  <p className="text-sm text-muted-foreground">of total network</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Added Restaurants</CardTitle>
          <CardDescription>Latest restaurant acquisitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentAdditions.slice(0, 8).map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.township}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDate(restaurant.created_at)}</p>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.users?.full_name || 'Unknown'}
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

export default RestaurantsReportPage;
