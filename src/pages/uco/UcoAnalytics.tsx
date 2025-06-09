
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart, TrendingUp, MapPin, Calendar } from 'lucide-react';

const UcoAnalytics = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const townshipMetrics = [
    { township: 'Yangon', totalKg: 1250, restaurants: 45, avgPrice: 1200 },
    { township: 'Mandalay', totalKg: 890, restaurants: 32, avgPrice: 1150 },
    { township: 'Naypyidaw', totalKg: 650, restaurants: 28, avgPrice: 1300 },
  ];

  const monthlyTrends = [
    { month: 'Jan', collected: 2800, revenue: 3360000 },
    { month: 'Feb', collected: 3200, revenue: 3840000 },
    { month: 'Mar', collected: 2950, revenue: 3540000 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UCO Analytics</h1>
            <p className="text-muted-foreground">
              Track UCO collection performance and township metrics
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Collected</p>
                <p className="text-2xl font-bold">2,790 kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold">3.2M MMK</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Active Townships</p>
                <p className="text-2xl font-bold">{townshipMetrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Avg Price/kg</p>
                <p className="text-2xl font-bold">1,217 MMK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Township Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Township Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {townshipMetrics.map((metric, index) => (
              <div key={metric.township} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{metric.township}</p>
                    <p className="text-sm text-muted-foreground">{metric.restaurants} restaurants</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{metric.totalKg} kg</p>
                    <p className="text-sm text-muted-foreground">{metric.avgPrice} MMK/kg</p>
                  </div>
                  <Badge variant="outline">
                    {((metric.totalKg / 2790) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{trend.month} 2024</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-semibold">{trend.collected} kg</p>
                    <p className="text-sm text-muted-foreground">Collected</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(trend.revenue / 1000000).toFixed(1)}M MMK</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${(trend.collected / 3200) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button variant="outline">
              Export Township Data
            </Button>
            <Button variant="outline">
              Export Monthly Report
            </Button>
            <Button variant="outline">
              Export Collection Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UcoAnalytics;
