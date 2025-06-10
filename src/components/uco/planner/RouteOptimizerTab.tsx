
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route } from 'lucide-react';
import { UcoRouteOptimizer } from '@/components/uco/UcoRouteOptimizer';
import { UcoCollectionItem, UcoCollectionPlan } from '@/types/ucoCollection';
import { toast } from 'sonner';

interface RouteOptimizerTabProps {
  collectionItems: UcoCollectionItem[] | undefined;
  plans: UcoCollectionPlan[] | undefined;
  setSelectedPlanId: (id: string) => void;
}

export const RouteOptimizerTab = ({ 
  collectionItems, 
  plans, 
  setSelectedPlanId 
}: RouteOptimizerTabProps) => {
  if (!collectionItems || collectionItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Route to Optimize</h3>
          <p className="text-muted-foreground mb-4">
            Select a collection plan to optimize the route
          </p>
          <Select onValueChange={setSelectedPlanId}>
            <SelectTrigger className="max-w-sm mx-auto">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <UcoRouteOptimizer 
      stops={collectionItems as any}
      onOptimize={(optimizedStops) => {
        toast.success('Route optimized! Open in Google Maps to navigate.');
      }}
    />
  );
};
