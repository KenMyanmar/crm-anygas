import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Users, 
  Clock,
  ArrowRight,
  Info,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const VisitPlannerPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, isLoading, createVisitPlan } = useVisitPlans();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    plan_date: '',
    remarks: ''
  });

  const handleCreatePlan = async () => {
    try {
      const newPlan = await createVisitPlan(formData);
      console.log('Created plan:', newPlan);
      setIsCreateDialogOpen(false);
      setFormData({ title: '', plan_date: '', remarks: '' });
      console.log('Navigating to:', `/visits/plans/${newPlan.id}`);
      navigate(`/visits/plans/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleNavigateToDetail = (planId: string) => {
    console.log('Navigating to plan detail:', planId);
    console.log('Navigation URL:', `/visits/plans/${planId}`);
    navigate(`/visits/plans/${planId}`);
  };

  const isMyPlan = (plan: any) => {
    return plan.created_by === profile?.id;
  };

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
            Plan and manage field visits - now visible to all team members
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Visit Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Visit Plan</DialogTitle>
              <DialogDescription>
                Set up a new visit plan for your field activities. This will be visible to all team members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Downtown Restaurant Visits"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan_date">Plan Date</Label>
                <Input
                  id="plan_date"
                  type="date"
                  value={formData.plan_date}
                  onChange={(e) => setFormData({ ...formData, plan_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any additional notes for this visit plan..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlan}
                disabled={!formData.title || !formData.plan_date}
              >
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* How it works info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Team Collaboration:</strong> All visit plans are now visible to all team members for better coordination. You can view everyone's plans and add restaurants to your own plans.
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
            <div className="space-y-4">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
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
                    <Badge variant="outline">
                      {format(new Date(plan.plan_date), 'MMM dd')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                        {isMyPlan(plan) ? 'Add Restaurants' : 'View Plan'} 
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitPlannerPage;
