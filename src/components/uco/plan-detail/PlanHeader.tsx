
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Route } from 'lucide-react';

interface PlanHeaderProps {
  planName: string;
  isOwner: boolean;
  onBack: () => void;
  onAddRestaurants: () => void;
  onOptimizeRoute: () => void;
}

export const PlanHeader = ({
  planName,
  isOwner,
  onBack,
  onAddRestaurants,
  onOptimizeRoute
}: PlanHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{planName}</h1>
          <p className="text-muted-foreground">UCO Collection Plan Details</p>
        </div>
      </div>
      
      {isOwner && (
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={onAddRestaurants}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Restaurants
          </Button>
          <Button onClick={onOptimizeRoute}>
            <Route className="h-4 w-4 mr-2" />
            Optimize Route
          </Button>
        </div>
      )}
    </div>
  );
};
