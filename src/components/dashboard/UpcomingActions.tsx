
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface UpcomingAction {
  id: string;
  restaurant_name: string;
  next_action_description: string;
  next_action_date: string;
  status: LeadStatus;
}

interface UpcomingActionsProps {
  actions: UpcomingAction[];
  onActionClick?: (id: string) => void;
}

const getStatusColor = (status: LeadStatus): string => {
  switch(status) {
    case 'CONTACT_STAGE':
      return 'bg-purple-500';
    case 'MEETING_STAGE':
      return 'bg-amber-500';
    case 'PRESENTATION_NEGOTIATION':
      return 'bg-teal-500';
    case 'CLOSED_WON':
      return 'bg-green-500';
    case 'CLOSED_LOST':
      return 'bg-red-500';
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

const UpcomingActions = ({ actions, onActionClick }: UpcomingActionsProps) => {
  const handleClick = (id: string) => {
    if (onActionClick) {
      onActionClick(id);
    }
  };

  const sortedActions = [...actions].sort((a, b) => {
    const dateA = parseISO(a.next_action_date);
    const dateB = parseISO(b.next_action_date);
    return dateA.getTime() - dateB.getTime();
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Actions</CardTitle>
        <Badge variant="outline">{actions.length} items</Badge>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming actions scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActions.map(action => {
              const actionDate = parseISO(action.next_action_date);
              const formattedDate = format(actionDate, 'MMM d, yyyy');
              const isOverdue = isPast(actionDate) && !isToday(actionDate);
              const isTodayAction = isToday(actionDate);
              
              return (
                <div 
                  key={action.id} 
                  className="flex flex-col space-y-1 p-3 rounded-md hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleClick(action.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StatusBadge status={action.status} />
                      <span className="font-medium truncate">{action.restaurant_name}</span>
                    </div>
                    <Badge variant={isOverdue ? "destructive" : isTodayAction ? "default" : "outline"}>
                      {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                      {formattedDate}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground pl-4 truncate">
                    {action.next_action_description}
                  </div>
                </div>
              );
            })}
            
            {actions.length > 5 && (
              <Button variant="link" className="w-full mt-2">
                View All Actions
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingActions;
