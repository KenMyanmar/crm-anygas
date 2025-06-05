
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Target,
  Heart
} from 'lucide-react';

interface MyanmarBusinessInsightsProps {
  dashboardData?: any;
  className?: string;
}

const MyanmarBusinessInsights: React.FC<MyanmarBusinessInsightsProps> = ({ 
  dashboardData, 
  className = '' 
}) => {
  const [currentSeason, setCurrentSeason] = useState<'monsoon' | 'dry_season'>('dry_season');
  const [seasonalMetrics, setSeasonalMetrics] = useState<any>({});

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    const isMonsonSeason = month >= 6 && month <= 10;
    setCurrentSeason(isMonsonSeason ? 'monsoon' : 'dry_season');
    
    // Calculate seasonal metrics based on current data
    calculateSeasonalMetrics();
  }, [dashboardData]);

  const calculateSeasonalMetrics = () => {
    if (!dashboardData) return;

    const leadSummary = dashboardData.lead_summary || [];
    const upcomingActions = dashboardData.upcoming_actions || [];
    const recentActivity = dashboardData.recent_activity || [];

    // Calculate relationship strength (cultural metric for Myanmar)
    const totalLeads = leadSummary.reduce((sum: number, item: any) => sum + item.count, 0);
    const wonLeads = leadSummary.find((item: any) => item.status === 'WON')?.count || 0;
    const relationshipStrength = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Calculate route efficiency (important for monsoon season)
    const routeEfficiency = upcomingActions.length > 0 ? 
      Math.max(60, 100 - (upcomingActions.length * 5)) : 85;

    // Youth engagement potential (based on new leads and activity)
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

  const getSeasonalRecommendations = () => {
    if (currentSeason === 'monsoon') {
      return [
        {
          icon: Cloud,
          title: 'Monsoon Logistics',
          description: 'Focus on indoor supplier meetings and relationship building',
          priority: 'high',
          action: 'Schedule covered meeting locations'
        },
        {
          icon: MapPin,
          title: 'Route Adaptation',
          description: 'Optimize routes for weather-accessible areas',
          priority: 'high',
          action: 'Review and update delivery schedules'
        },
        {
          icon: Heart,
          title: 'Supplier Support',
          description: 'Provide extra support to suppliers during difficult season',
          priority: 'medium',
          action: 'Increase communication frequency'
        }
      ];
    } else {
      return [
        {
          icon: Sun,
          title: 'Expansion Opportunity',
          description: 'Ideal time for new supplier acquisition',
          priority: 'high',
          action: 'Launch recruitment campaigns'
        },
        {
          icon: Users,
          title: 'Relationship Building',
          description: 'Strengthen bonds with face-to-face meetings',
          priority: 'medium',
          action: 'Schedule supplier appreciation events'
        },
        {
          icon: Target,
          title: 'Youth Engagement',
          description: 'Perfect weather for educational outreach programs',
          priority: 'medium',
          action: 'Organize community events'
        }
      ];
    }
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

  const recommendations = getSeasonalRecommendations();
  const culturalMetrics = getCulturalMetrics();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Seasonal Context Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {currentSeason === 'monsoon' ? 
                <Cloud className="h-5 w-5 text-blue-600" /> : 
                <Sun className="h-5 w-5 text-yellow-600" />
              }
              <span>Myanmar Business Context</span>
            </CardTitle>
            <Badge variant={currentSeason === 'monsoon' ? 'destructive' : 'default'}>
              {currentSeason === 'monsoon' ? '🌧️ Monsoon Season' : '☀️ Dry Season'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              {currentSeason === 'monsoon' 
                ? 'Focus on relationship strengthening and indoor activities. Weather challenges expected until October.'
                : 'Optimal period for expansion, supplier visits, and youth engagement programs.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cultural Business Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Cultural Business Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {culturalMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="font-medium text-sm">{metric.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{metric.value}%</span>
                    {metric.value >= metric.target ? 
                      <TrendingUp className="h-3 w-3 text-green-600" /> :
                      <TrendingDown className="h-3 w-3 text-yellow-600" />
                    }
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Strategic Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <rec.icon className={`h-5 w-5 mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      → {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {seasonalMetrics.totalLeads || 0}
              </div>
              <div className="text-xs text-gray-600">Total Suppliers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {seasonalMetrics.pendingActions || 0}
              </div>
              <div className="text-xs text-gray-600">Pending Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyanmarBusinessInsights;
