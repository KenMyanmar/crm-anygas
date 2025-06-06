
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Activity, MapPin, DollarSign } from 'lucide-react';
import { GoalTracking } from '@/hooks/usePerformanceAnalytics';

interface GoalTrackingSectionProps {
  goalTracking: GoalTracking[];
}

export const GoalTrackingSection = ({ goalTracking }: GoalTrackingSectionProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-100 text-green-800';
    if (progress >= 75) return 'bg-blue-100 text-blue-800';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Goal Achievement Tracking</span>
        </CardTitle>
        <CardDescription>Monthly performance goals vs actual achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goalTracking.map((goal) => (
            <div key={goal.salespersonId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{goal.salespersonName}</h3>
                <Badge className={getProgressBadgeColor(goal.overallProgress)}>
                  {goal.overallProgress.toFixed(1)}% Overall
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Login Activity</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.actualLogins} / {goal.monthlyLoginGoal} logins
                  </div>
                  <Progress 
                    value={Math.min((goal.actualLogins / goal.monthlyLoginGoal) * 100, 100)} 
                    className="h-2"
                  />
                  <div className={`text-xs font-medium ${getProgressColor((goal.actualLogins / goal.monthlyLoginGoal) * 100)}`}>
                    {((goal.actualLogins / goal.monthlyLoginGoal) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Visit Completion</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.actualVisits} / {goal.monthlyVisitGoal} visits
                  </div>
                  <Progress 
                    value={Math.min((goal.actualVisits / goal.monthlyVisitGoal) * 100, 100)} 
                    className="h-2"
                  />
                  <div className={`text-xs font-medium ${getProgressColor((goal.actualVisits / goal.monthlyVisitGoal) * 100)}`}>
                    {((goal.actualVisits / goal.monthlyVisitGoal) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Lead Generation</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.actualLeads} / {goal.monthlyLeadGoal} leads
                  </div>
                  <Progress 
                    value={Math.min((goal.actualLeads / goal.monthlyLeadGoal) * 100, 100)} 
                    className="h-2"
                  />
                  <div className={`text-xs font-medium ${getProgressColor((goal.actualLeads / goal.monthlyLeadGoal) * 100)}`}>
                    {((goal.actualLeads / goal.monthlyLeadGoal) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-700" />
                    <span className="text-sm font-medium">Revenue Target</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(goal.actualRevenue)}K / {formatCurrency(goal.monthlyRevenueGoal)}K
                  </div>
                  <Progress 
                    value={Math.min((goal.actualRevenue / goal.monthlyRevenueGoal) * 100, 100)} 
                    className="h-2"
                  />
                  <div className={`text-xs font-medium ${getProgressColor((goal.actualRevenue / goal.monthlyRevenueGoal) * 100)}`}>
                    {((goal.actualRevenue / goal.monthlyRevenueGoal) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
