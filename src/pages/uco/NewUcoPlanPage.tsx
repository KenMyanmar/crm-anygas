
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUcoCollectionPlans } from '@/hooks/useUcoCollectionPlans';
import { useTownshipAnalytics } from '@/hooks/useTownshipAnalytics';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Calendar, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const NewUcoPlanPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createPlan } = useUcoCollectionPlans();
  const { analytics } = useTownshipAnalytics();
  
  const [planData, setPlanData] = useState({
    plan_name: '',
    township: '',
    plan_date: new Date().toISOString().split('T')[0],
    driver_name: '',
    truck_capacity_kg: 500,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast.error('You must be logged in to create plans');
      return;
    }

    if (!planData.plan_name || !planData.township) {
      toast.error('Please fill in plan name and township');
      return;
    }

    try {
      await createPlan.mutateAsync({
        ...planData,
        created_by: profile.id,
      });
      
      toast.success('UCO collection plan created successfully');
      navigate('/uco/planner');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/uco/planner')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Planner
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New UCO Collection Plan</h1>
          <p className="text-muted-foreground">
            Set up a new UCO collection plan for a specific township
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input
                  value={planData.plan_name}
                  onChange={(e) => setPlanData({ ...planData, plan_name: e.target.value })}
                  placeholder="e.g., Yankin Township UCO Collection"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Township</label>
                <Select
                  value={planData.township}
                  onValueChange={(value) => setPlanData({ ...planData, township: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select township" />
                  </SelectTrigger>
                  <SelectContent>
                    {analytics?.map((item) => (
                      <SelectItem key={item.township} value={item.township}>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{item.township} ({item.total_restaurants} restaurants)</span>
                        </div>
                      </SelectItem>
                    ))}
                    {(!analytics || analytics.length === 0) && (
                      <SelectItem value="Yankin">Yankin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Date</label>
                <Input
                  type="date"
                  value={planData.plan_date}
                  onChange={(e) => setPlanData({ ...planData, plan_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Driver Name</label>
                <Input
                  value={planData.driver_name}
                  onChange={(e) => setPlanData({ ...planData, driver_name: e.target.value })}
                  placeholder="Enter driver name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Truck Capacity (kg)</label>
                <Input
                  type="number"
                  value={planData.truck_capacity_kg}
                  onChange={(e) => setPlanData({ ...planData, truck_capacity_kg: Number(e.target.value) })}
                  placeholder="500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={createPlan.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createPlan.isPending ? 'Creating...' : 'Create Plan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/uco/planner')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Plan Preview */}
      {planData.plan_name && planData.township && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Plan Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Plan Name</p>
                <p className="text-muted-foreground">{planData.plan_name}</p>
              </div>
              <div>
                <p className="font-medium">Township</p>
                <p className="text-muted-foreground">{planData.township}</p>
              </div>
              <div>
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">{new Date(planData.plan_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-muted-foreground">{planData.truck_capacity_kg} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewUcoPlanPage;
