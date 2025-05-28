
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

interface EmptyVisitPlanProps {
  onAddRestaurants: () => void;
}

const EmptyVisitPlan = ({ onAddRestaurants }: EmptyVisitPlanProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No restaurants added yet</h3>
        <p className="text-muted-foreground mb-6">
          Start by adding restaurants to visit for this plan.
        </p>
        <Button 
          onClick={onAddRestaurants}
          className="animate-pulse"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurants
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Our bulk restaurant selector allows you to add multiple restaurants at once,
          with filtering by township and lead status.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyVisitPlan;
