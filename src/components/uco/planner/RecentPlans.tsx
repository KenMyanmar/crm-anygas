
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Download } from 'lucide-react';
import { UcoCollectionPlan } from '@/types/ucoCollection';

interface RecentPlansProps {
  plans: UcoCollectionPlan[] | undefined;
  onSelectPlan: (planId: string) => void;
  onExportPlan: (planId: string) => void;
}

export const RecentPlans = ({ plans, onSelectPlan, onExportPlan }: RecentPlansProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent UCO Collection Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plans?.slice(0, 5).map((plan) => (
            <div 
              key={plan.id} 
              className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelectPlan(plan.id)}
            >
              <div className="flex-1">
                <h4 className="font-medium">{plan.plan_name}</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {plan.townships.join(', ')}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(plan.plan_date).toLocaleDateString()}
                  </span>
                  {plan.driver_name && (
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {plan.driver_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan.id);
                  }}
                >
                  Select
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportPlan(plan.id);
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
