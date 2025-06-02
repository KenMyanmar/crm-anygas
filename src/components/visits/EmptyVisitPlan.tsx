
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Eye } from 'lucide-react';

interface EmptyVisitPlanProps {
  onAddRestaurants?: () => void;
}

const EmptyVisitPlan = ({ onAddRestaurants }: EmptyVisitPlanProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No restaurants in this plan</h3>
        {onAddRestaurants ? (
          <>
            <p className="text-muted-foreground mb-4">
              Start building your visit schedule by adding restaurants to this plan.
            </p>
            <Button onClick={onAddRestaurants}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurants
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              This visit plan doesn't have any restaurants added yet. Contact the plan creator to add restaurants.
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              <span>View-only access</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyVisitPlan;
