
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileStatusUpdater } from '@/components/uco/MobileStatusUpdater';
import { ArrowLeft, Truck, MapPin, Navigation, Phone } from 'lucide-react';
import { format, isToday } from 'date-fns';

const UcoMobileInterface = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get current location for GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <h1 className="text-lg font-bold">UCO Driver Interface</h1>
        <div className="flex items-center space-x-2">
          {currentLocation && (
            <Badge variant="outline" className="text-xs">
              <Navigation className="h-3 w-3 mr-1" />
              GPS
            </Badge>
          )}
        </div>
      </div>

      {/* Current Date */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Date</p>
              <p className="font-semibold">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
            </div>
            <Truck className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">View Route</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium">Call Support</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Status Updater Component */}
      <MobileStatusUpdater />

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">Planned</Badge>
            <span className="text-xs">Ready to visit</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-100 text-yellow-800">En Route</Badge>
            <span className="text-xs">Driving to location</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-orange-100 text-orange-800">Visited</Badge>
            <span className="text-xs">At restaurant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
            <span className="text-xs">UCO collected</span>
          </div>
        </CardContent>
      </Card>

      {/* Offline Indicator */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Data syncs automatically when online
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UcoMobileInterface;
