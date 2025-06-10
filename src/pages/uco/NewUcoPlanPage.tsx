
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUcoCollectionPlans } from '@/hooks/useUcoCollectionPlans';
import { useTownshipAnalytics } from '@/hooks/useTownshipAnalytics';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Truck, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

const NewUcoPlanPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createPlan } = useUcoCollectionPlans();
  const { analytics } = useTownshipAnalytics();
  
  const [formData, setFormData] = useState({
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

    if (!formData.plan_name || !formData.township) {
      toast.error('Please fill in plan name and township');
      return;
    }

    try {
      const newPlan = await createPlan.mutateAsync({
        ...formData,
        created_by: profile.id,
      });
      
      toast.success('UCO collection plan created successfully');
      // Redirect to plan detail page (like visits pattern)
      navigate(`/uco/plans/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create UCO collection plan');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New UCO Collection Plan</h1>
            <p className="text-muted-foreground">Set up a new Used Cooking Oil collection schedule</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span>Collection Plan Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan_name">Plan Name *</Label>
                  <Input
                    id="plan_name"
                    value={formData.plan_name}
                    onChange={(e) => handleInputChange('plan_name', e.target.value)}
                    placeholder="e.g., Yankin Township UCO Collection"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="township">Township *</Label>
                  <Select
                    value={formData.township}
                    onValueChange={(value) => handleInputChange('township', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select township" />
                    </SelectTrigger>
                    <SelectContent>
                      {analytics?.map((item) => (
                        <SelectItem key={item.township} value={item.township}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{item.township} ({item.total_restaurants} restaurants)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan_date">Collection Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="plan_date"
                      type="date"
                      value={formData.plan_date}
                      onChange={(e) => handleInputChange('plan_date', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="driver_name"
                      value={formData.driver_name}
                      onChange={(e) => handleInputChange('driver_name', e.target.value)}
                      placeholder="Enter driver name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="truck_capacity">Truck Capacity (kg)</Label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="truck_capacity"
                      type="number"
                      value={formData.truck_capacity_kg}
                      onChange={(e) => handleInputChange('truck_capacity_kg', parseInt(e.target.value) || 0)}
                      placeholder="500"
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/uco/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlan.isPending}
                  className="min-w-[120px]"
                >
                  {createPlan.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Plan'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewUcoPlanPage;
