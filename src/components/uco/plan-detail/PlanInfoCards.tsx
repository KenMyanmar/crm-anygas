
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { UcoCollectionPlan } from '@/types/ucoCollection';

interface PlanInfoCardsProps {
  plan: UcoCollectionPlan;
}

export const PlanInfoCards = ({ plan }: PlanInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Collection Date</p>
              <p className="font-medium">{format(new Date(plan.plan_date), 'EEEE, MMM dd, yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Townships</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {plan.townships.slice(0, 2).map(township => (
                  <Badge key={township} variant="outline" className="text-xs">
                    {township}
                  </Badge>
                ))}
                {plan.townships.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{plan.townships.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Driver</p>
              <p className="font-medium">{plan.driver_name || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Truck Capacity</p>
              <p className="font-medium">{plan.truck_capacity_kg}kg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
