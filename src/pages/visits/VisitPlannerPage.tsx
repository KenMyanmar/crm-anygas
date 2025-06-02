
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { useVisitTasks } from '@/hooks/useVisitTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Plus, 
  Clock,
  ArrowRight,
  Info,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const VisitPlannerPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, isLoading } = useVisitPlans();
  const { tasks } = useVisitTasks();

  const handleNavigateToDetail = (planId: string) => {
    navigate(`/visits/plans/${planId}`);
  };

  const isMyPlan = (plan: any) => {
    return plan.created_by === profile?.id;
  };

  const getPlanStatus = (planDate: string) => {
    const date = new Date(planDate);
    if (isToday(date)) return { label: 'Today', color: 'bg-green-100 text-green-800' };
    if (isTomorrow(date)) return { label: 'Tomorrow', color: 'bg-blue-100 text-blue-800' };
    if (isPast(date)) return { label: 'Past', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Upcoming', color: 'bg-orange-100 text-orange-800' };
  };

  // Calculate stats
  const todaysPlans = plans.filter(plan => isToday(new Date(plan.plan_date)));
  const upcomingPlans = plans.filter(plan => !isPast(new Date(plan.plan_date)) && !isToday(new Date(plan.plan_date)));
  const myPlans = plans.filter(plan => isMyPlan(plan));
  const todaysTasks = tasks.filter(task => task.visit_time && isToday(new Date(task.visit_time)));

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading visit plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visit Planner</h1>
          <p className="text-muted-foreground">
            Plan, manage, and track your field visits
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/visits/today')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Today's Visits
          </Button>
          <Button onClick={() => navigate('/visits/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Visit Plan
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
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">My Plans</p>
                <p className="text-2xl font-bold">{myPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Today's Tasks</p>
                <p className="text-2xl font-bold">{todaysTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {todaysPlans.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>You have {todaysPlans.length} visit plan(s) for today.</strong> Ready to start your visits?
              </span>
              <Button 
                size="sm" 
                onClick={() => navigate('/visits/today')}
              >
                View Today's Visits
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Team Collaboration:</strong> All visit plans are visible to team members for coordination. You can view everyone's plans and collaborate effectively.
        </AlertDescription>
      </Alert>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No visit plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first visit plan to start organizing your field activities.
            </p>
            <Button onClick={() => navigate('/visits/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans
            .sort((a, b) => new Date(a.plan_date).getTime() - new Date(b.plan_date).getTime())
            .map((plan) => {
              const status = getPlanStatus(plan.plan_date);
              return (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    isMyPlan(plan) ? 'ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handleNavigateToDetail(plan.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {isMyPlan(plan) && (
                          <Badge variant="default" className="text-xs">
                            My Plan
                          </Badge>
                        )}
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(plan.plan_date), 'EEEE, MMMM dd, yyyy')}
                      </div>
                      
                      {plan.remarks && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.remarks}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          Created {format(new Date(plan.created_at), 'MMM dd')}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToDetail(plan.id);
                          }}
                        >
                          {isMyPlan(plan) ? 'Manage' : 'View'} 
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default VisitPlannerPage;
