
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Users } from 'lucide-react';

interface RestaurantInfoProps {
  restaurant: {
    id: string;
    name: string;
    township: string | null;
    address: string | null;
    phone: string | null;
    contact_person: string | null;
    remarks?: string | null;
    created_at: string;
    updated_at: string;
  };
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-base font-medium">{restaurant.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Township</h3>
              <p className="text-base font-medium flex items-center">
                {restaurant.township ? (
                  <>
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {restaurant.township}
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Not specified</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
              <p className="text-base font-medium flex items-center">
                {restaurant.contact_person ? (
                  <>
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {restaurant.contact_person}
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Not specified</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
              <p className="text-base font-medium flex items-center">
                {restaurant.phone ? (
                  <>
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    {restaurant.phone}
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Not specified</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-base font-medium">
              {restaurant.address || (
                <span className="text-muted-foreground italic">No address available</span>
              )}
            </p>
          </div>

          {restaurant.remarks && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
              <p className="text-base">
                {restaurant.remarks}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantInfo;
