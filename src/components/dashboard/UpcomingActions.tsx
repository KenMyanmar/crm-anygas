
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface UpcomingAction {
  id: string;
  restaurant_name: string;
  next_action_description: string;
  next_action_date: string;
  status: LeadStatus;
}

interface UpcomingActionsProps {
  actions: UpcomingAction[];
}

const getStatusColor = (status: LeadStatus): string => {
  switch(status) {
    case 'NEW':
      return 'bg-blue-500';
    case 'CONTACTED':
      return 'bg-purple-500';
    case 'NEEDS_FOLLOW_UP':
      return 'bg-amber-500';
    case 'TRIAL':
      return 'bg-orange-500';
    case 'NEGOTIATION':
      return 'bg-teal-500';
    case 'WON':
      return 'bg-green-500';
    case 'LOST':
      return 'bg-red-500';
    case 'ON_HOLD':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const bgColor = getStatusColor(status);
  
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${bgColor}`}></span>
  );
};

const UpcomingActions = ({ actions }: UpcomingActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming actions scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map(action => {
              const formattedDate = format(new Date(action.next_action_date), 'MMM d, yyyy');
              const isToday = format(new Date(action.next_action_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <Link to={`/leads/${action.id}`} key={action.id} className="block">
                  <div className="flex flex-col space-y-1 p-3 rounded-md hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <StatusBadge status={action.status} />
                        <span className="font-medium">{action.restaurant_name}</span>
                      </div>
                      <Badge variant={isToday ? "destructive" : "outline"}>
                        {formattedDate}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground pl-4">
                      {action.next_action_description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingActions;
