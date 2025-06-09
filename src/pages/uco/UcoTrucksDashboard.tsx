
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUcoCollectionPlans } from '@/hooks/useUcoCollectionPlans';
import { 
  Truck, 
  Calendar, 
  MapPin, 
  Activity,
  Plus,
  Route,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

const UcoTrucksDashboard = () => {
  const navigate = useNavigate();
  const { plans, isLoading } = useUcoCollectionPlans();

  const todaysPlans = plans?.filter(plan => plan.plan_date && isToday(new Date(plan.plan_date))) || [];
  const tomorrowsPlans = plans?.filter(plan => plan.plan_date && isTomorrow(new Date(plan.plan_date))) || [];
  const upcomingPlans = plans?.filter(plan => {
    if (!plan.plan_date) return false;
    const planDate = new Date(plan.plan_date);
    return planDate > new Date() && !isTomorrow(planDate);
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading UCO collection data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">UCO Trucks Visit Dashboard</h1>
          <p className="text-muted-foreground">
            Manage daily UCO collection plans and truck routes
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/uco/mobile')}
          >
            <Truck className="h-4 w-4 mr-2" />
            Driver Interface
          </Button>
          <Button onClick={() => navigate('/uco/planner')}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection Plan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Today's Plans</p>
                <p className="text-2xl font-bold">{todaysPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Tomorrow's Plans</p>
                <p className="text-2xl font-bold">{tomorrowsPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Plans</p>
                <p className="text-2xl font-bold">{plans?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/uco/planner')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Collection Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Create and manage daily UCO collection plans</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/uco/routes')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2" />
              Route Optimizer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Optimize truck routes for efficient collection</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/uco/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              UCO Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View collection metrics and township analytics</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Plans */}
      {plans && plans.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Collection Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{plan.plan_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{plan.township}</span>
                    </div>
                    <Badge variant="outline">
                      {plan.plan_date ? format(new Date(plan.plan_date), 'MMM dd, yyyy') : 'No date'}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/uco/planner?planId=${plan.id}`)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No UCO collection plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first UCO collection plan to start managing truck visits.
            </p>
            <Button onClick={() => navigate('/uco/planner')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UcoTrucksDashboard;
