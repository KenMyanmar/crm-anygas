
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users, TrendingUp, Download, Calendar } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';

interface VisitsData {
  totalVisits: number;
  completedVisits: number;
  plannedVisits: number;
  completionRate: number;
  avgDuration: number;
  visitsByStatus: any[];
  visitsByTownship: any[];
  dailyVisits: any[];
  recentVisits: any[];
}

const VisitsReportPage = () => {
  const [data, setData] = useState<VisitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchVisitsData();
  }, [timeRange]);

  const fetchVisitsData = async () => {
    try {
      setLoading(true);
      
      // Fetch visit data
      const { data: visits, error } = await supabase
        .from('visit_tasks_detailed')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalVisits = visits?.length || 0;
      const completedVisits = visits?.filter(v => v.status === 'VISITED').length || 0;
      const plannedVisits = visits?.filter(v => v.status === 'PLANNED').length || 0;
      const completionRate = totalVisits > 0 ? (Number(completedVisits) / Number(totalVisits)) * 100 : 0;

      // Average duration
      const visitsWithDuration = visits?.filter(v => v.estimated_duration_minutes) || [];
      const avgDuration = visitsWithDuration.length > 0
        ? visitsWithDuration.reduce((sum, v) => sum + (Number(v.estimated_duration_minutes) || 0), 0) / visitsWithDuration.length
        : 60;

      // Visits by status
      const statusCounts = visits?.reduce((acc: any, visit) => {
        const status = visit.status || 'PLANNED';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      const visitsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count,
        percentage: totalVisits > 0 ? ((count as number) / totalVisits * 100).toFixed(1) : 0
      }));

      // Visits by township
      const townshipCounts = visits?.reduce((acc: any, visit) => {
        const township = visit.township || 'Unknown';
        acc[township] = (acc[township] || 0) + 1;
        return acc;
      }, {}) || {};

      const visitsByTownship = Object.entries(townshipCounts)
        .map(([township, count]) => ({
          township,
          count: Number(count),
          percentage: totalVisits > 0 ? ((Number(count)) / totalVisits * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily visits for the last 7 days (mock data)
      const dailyVisits = [
        { date: 'Mon', visits: 12, completed: 8 },
        { date: 'Tue', visits: 15, completed: 12 },
        { date: 'Wed', visits: 18, completed: 14 },
        { date: 'Thu', visits: 20, completed: 16 },
        { date: 'Fri', visits: 22, completed: 18 },
        { date: 'Sat', visits: 8, completed: 6 },
        { date: 'Sun', visits: 5, completed: 4 }
      ];

      setData({
        totalVisits,
        completedVisits,
        plannedVisits,
        completionRate,
        avgDuration,
        visitsByStatus,
        visitsByTownship,
        dailyVisits,
        recentVisits: visits?.slice(0, 10) || []
      });

    } catch (error: any) {
      console.error('Error fetching visits data:', error);
      toast({
        title: "Error",
        description: "Failed to load visits data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    visits: {
      label: "Visits",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))",
    },
  };

  const statusColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          <h1 className="text-3xl font-bold tracking-tight">Visits & Engagement Report</h1>
          <p className="text-muted-foreground">Visit completion rates and customer engagement metrics</p>
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
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{data.totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{Math.round(data.avgDuration)}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Planned Visits</p>
                <p className="text-2xl font-bold">{data.plannedVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visit Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Visit Activity</CardTitle>
            <CardDescription>Planned vs completed visits by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visits" fill="var(--color-visits)" name="Planned" />
                  <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Visit Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Status Distribution</CardTitle>
            <CardDescription>Current status of all visits</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.visitsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                  >
                    {data.visitsByStatus.map((entry, index) => (
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

      {/* Top Townships by Visits */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Distribution by Township</CardTitle>
          <CardDescription>Areas with highest visit frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.visitsByTownship.map((township, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{township.township}</p>
                    <p className="text-sm text-muted-foreground">{township.count} visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{township.percentage}%</p>
                  <p className="text-sm text-muted-foreground">of total visits</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visit Activity</CardTitle>
          <CardDescription>Latest visit updates and completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentVisits.slice(0, 5).map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{visit.restaurant_name}</p>
                    <p className="text-sm text-muted-foreground">{visit.township}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={visit.status === 'VISITED' ? 'default' : 'secondary'}>
                    {visit.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {visit.visit_time ? formatDate(visit.visit_time) : 'TBD'}
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

export default VisitsReportPage;
