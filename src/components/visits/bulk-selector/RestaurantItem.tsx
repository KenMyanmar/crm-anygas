
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { RestaurantWithLead } from '@/types/visits';

interface RestaurantItemProps {
  restaurant: RestaurantWithLead;
  isSelected: boolean;
  onToggle: (restaurantId: string, checked: boolean) => void;
}

const RestaurantItem = ({
  restaurant,
  isSelected,
  onToggle
}: RestaurantItemProps) => {
  const getLeadStatusColor = (status?: string) => {
    switch (status) {
      case 'CONTACT_STAGE': return 'bg-purple-100 text-purple-800';
      case 'MEETING_STAGE': return 'bg-amber-100 text-amber-800';
      case 'PRESENTATION_NEGOTIATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED_WON': return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => 
            onToggle(restaurant.id, checked as boolean)
          }
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold truncate">{restaurant.name}</h3>
            {restaurant.lead_status && (
              <Badge className={getLeadStatusColor(restaurant.lead_status)}>
                {restaurant.lead_status.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            {restaurant.township && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {restaurant.township}
              </div>
            )}
            {restaurant.contact_person && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {restaurant.contact_person}
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {restaurant.phone}
              </div>
            )}
          </div>
          {restaurant.next_action_date && (
            <div className="flex items-center text-sm text-amber-600 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              Next action: {format(new Date(restaurant.next_action_date), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RestaurantItem;
