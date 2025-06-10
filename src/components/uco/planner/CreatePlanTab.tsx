
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UcoTownshipMultiSelector } from '@/components/uco/UcoTownshipMultiSelector';

interface NewPlanState {
  plan_name: string;
  townships: string[];
  plan_date: string;
  driver_name: string;
  truck_capacity_kg: number;
}

interface CreatePlanTabProps {
  newPlan: NewPlanState;
  setNewPlan: (plan: NewPlanState) => void;
  onCreatePlan: () => void;
  isCreating: boolean;
}

export const CreatePlanTab = ({ 
  newPlan, 
  setNewPlan, 
  onCreatePlan, 
  isCreating 
}: CreatePlanTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Plan Name</label>
          <Input
            value={newPlan.plan_name}
            onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
            placeholder="e.g., Multi-Township UCO Collection"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Plan Date</label>
          <Input
            type="date"
            value={newPlan.plan_date}
            onChange={(e) => setNewPlan({ ...newPlan, plan_date: e.target.value })}
          />
        </div>
      </div>

      <UcoTownshipMultiSelector
        selectedTownships={newPlan.townships}
        onChange={(townships) => setNewPlan({ ...newPlan, townships })}
        placeholder="Select townships for collection"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Driver Name</label>
          <Input
            value={newPlan.driver_name}
            onChange={(e) => setNewPlan({ ...newPlan, driver_name: e.target.value })}
            placeholder="Enter driver name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Truck Capacity (kg)</label>
          <Input
            type="number"
            value={newPlan.truck_capacity_kg}
            onChange={(e) => setNewPlan({ ...newPlan, truck_capacity_kg: parseInt(e.target.value) || 500 })}
            placeholder="500"
          />
        </div>
      </div>
      
      <Button 
        onClick={onCreatePlan} 
        className="w-full" 
        disabled={newPlan.townships.length === 0 || isCreating}
      >
        {isCreating ? 'Creating...' : 'Create UCO Collection Plan'}
      </Button>
    </div>
  );
};
