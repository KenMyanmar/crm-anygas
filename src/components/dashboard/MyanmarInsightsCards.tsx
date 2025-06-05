
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  Heart,
  Target,
  Calendar
} from 'lucide-react';

interface MyanmarInsightsCardsProps {
  dashboardData?: any;
  className?: string;
}

const MyanmarInsightsCards: React.FC<MyanmarInsightsCardsProps> = ({ 
  dashboardData, 
  className = '' 
}) => {
  const [currentSeason, setCurrentSeason] = useState<'monsoon' | 'dry_season'>('dry_season');
  const [seasonalMetrics, setSeasonalMetrics] = useState<any>({});

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    const isMonsonSeason = month >= 6 && month <= 10;
    setCurrentSeason(isMonsonSeason ? 'monsoon' : 'dry_season');
    
    calculateSeasonalMetrics();
  }, [dashboardData]);

  const calculateSeasonalMetrics = () => {
    if (!dashboardData) return;

    const leadSummary = dashboardData.lead_summary || [];
    const upcomingActions = dashboardData.upcoming_actions || [];
    const recentActivity = dashboardData.recent_activity || [];

    const totalLeads = leadSummary.reduce((sum: number, item: any) => sum + item.count, 0);
    const wonLeads = leadSummary.find((item: any) => item.status === 'WON')?.count || 0;
    const relationshipStrength = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const routeEfficiency = upcomingActions.length > 0 ? 
      Math.max(60, 100 - (upcomingActions.length * 5)) : 85;

    const newActivity = recentActivity.filter((activity: any) => {
      const activityDate = new Date(activity.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate >= weekAgo;
    }).length;
    
    const youthEngagementPotential = Math.min(100, newActivity * 10 + 30);

    setSeasonalMetrics({
      relationshipStrength,
      routeEfficiency,
      youthEngagementPotential,
      totalLeads,
      pendingActions: upcomingActions.length,
      recentActivityCount: newActivity
    });
  };

  const getCulturalMetrics = () => {
    return [
      {
        title: 'Relationship Strength',
        value: seasonalMetrics.relationshipStrength || 0,
        description: 'Trust and loyalty with suppliers',
        icon: Heart,
        color: 'text-red-600',
        target: 75
      },
      {
        title: 'Route Efficiency',
        value: seasonalMetrics.routeEfficiency || 0,
        description: 'Logistics performance considering weather',
        icon: MapPin,
        color: 'text-blue-600',
        target: 80
      },
      {
        title: 'Youth Engagement Potential',
        value: seasonalMetrics.youthEngagementPotential || 0,
        description: 'Opportunities for education and development',
        icon: Users,
        color: 'text-green-600',
        target: 60
      }
    ];
  };

  const culturalMetrics = getCulturalMetrics();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Seasonal Context */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              {currentSeason === 'monsoon' ? 
                <Cloud className="h-4 w-4 text-blue-600" /> : 
                <Sun className="h-4 w-4 text-yellow-600" />
              }
              <span>Myanmar Business Context</span>
            </CardTitle>
            <Badge variant={currentSeason === 'monsoon' ? 'destructive' : 'default'} className="text-xs">
              {currentSeason === 'monsoon' ? '🌧️ Monsoon' : '☀️ Dry Season'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {currentSeason === 'monsoon' 
              ? 'Focus on relationship strengthening and indoor activities. Weather challenges expected until October.'
              : 'Optimal period for expansion, supplier visits, and youth engagement programs.'
            }
          </p>
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-gray-500">Business Impact</span>
            <Badge variant="outline" className="text-xs">
              {currentSeason === 'monsoon' ? 'Medium Risk' : 'High Opportunity'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Metrics */}
      {culturalMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="font-medium text-sm">{metric.title}</span>
              </div>
              {metric.value >= metric.target ? 
                <TrendingUp className="h-3 w-3 text-green-600" /> :
                <TrendingDown className="h-3 w-3 text-yellow-600" />
              }
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}%</span>
                <Badge variant={metric.value >= metric.target ? "default" : "secondary"} className="text-xs">
                  Target: {metric.target}%
                </Badge>
              </div>
              <Progress value={metric.value} className="h-2" />
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Target className="h-4 w-4 mr-2 text-blue-600" />
            Business Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Suppliers</span>
              <span className="text-lg font-semibold text-blue-600">
                {seasonalMetrics.totalLeads || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Actions</span>
              <span className="text-lg font-semibold text-green-600">
                {seasonalMetrics.pendingActions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Activity</span>
              <span className="text-lg font-semibold text-purple-600">
                {seasonalMetrics.recentActivityCount || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyanmarInsightsCards;
