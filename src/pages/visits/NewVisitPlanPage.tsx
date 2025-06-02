
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisitPlans } from '@/hooks/useVisitPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  ArrowLeft,
  Plus,
  Info,
  CheckCircle
} from 'lucide-react';

const NewVisitPlanPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createVisitPlan } = useVisitPlans();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    plan_date: '',
    remarks: ''
  });

  const handleCreatePlan = async () => {
    if (!formData.title || !formData.plan_date) return;

    try {
      setIsCreating(true);
      const newPlan = await createVisitPlan(formData);
      console.log('Created plan:', newPlan);
      
      // Navigate to the newly created plan
      navigate(`/visits/plans/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.title.trim() && formData.plan_date;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/visits')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Visit Planner
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Visit Plan</h1>
          <p className="text-muted-foreground">
            Set up a new visit plan for your field activities
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Team Visibility:</strong> Your visit plan will be visible to all team members for better coordination and collaboration.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Downtown Restaurant Visits, Weekly Client Check-ins"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive title that helps identify this visit plan
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_date">Planned Date *</Label>
                <Input
                  id="plan_date"
                  type="date"
                  value={formData.plan_date}
                  onChange={(e) => handleInputChange('plan_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Select the date when you plan to execute these visits
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Additional Notes (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Any special instructions, goals, or notes for this visit plan..."
                  rows={4}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Add any additional context or instructions for this visit plan
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/visits')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlan}
                disabled={!isFormValid || isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Add Restaurants</p>
                  <p className="text-muted-foreground">Select the restaurants you want to visit and set visit sequences</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Set Visit Times</p>
                  <p className="text-muted-foreground">Schedule specific times and estimate duration for each visit</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Execute & Track</p>
                  <p className="text-muted-foreground">Use the Today's Visits page to track progress and record outcomes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewVisitPlanPage;
