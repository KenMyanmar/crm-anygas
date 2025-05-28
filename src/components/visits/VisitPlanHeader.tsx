
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Plus, Users, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { VisitPlan } from '@/types/visits';

interface VisitPlanHeaderProps {
  plan: VisitPlan;
  onBack: () => void;
  onAddRestaurants: () => void;
}

const VisitPlanHeader = ({ plan, onBack, onAddRestaurants }: VisitPlanHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
          <p className="text-muted-foreground">
            {format(new Date(plan.plan_date), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {plan.team_visible && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Users className="h-4 w-4 mr-1" />
            Team Visible
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onAddRestaurants}
                className="relative"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurants
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-pulse">
                  <ListFilter className="h-3 w-3" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add multiple restaurants with advanced filtering options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default VisitPlanHeader;
