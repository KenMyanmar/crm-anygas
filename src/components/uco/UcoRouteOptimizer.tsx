
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, MapPin, Clock, Truck, Navigation } from 'lucide-react';
import { UcoStatusBadge } from './UcoStatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface RouteStop {
  id: string;
  restaurant: {
    name: string;
    township: string;
    address?: string;
  };
  uco_status: string;
  collection_priority: string;
  expected_volume_kg?: number;
  route_sequence: number;
  estimated_time_minutes?: number;
}

interface UcoRouteOptimizerProps {
  stops: RouteStop[];
  onOptimize?: (optimizedStops: RouteStop[]) => void;
}

export const UcoRouteOptimizer: React.FC<UcoRouteOptimizerProps> = ({ 
  stops, 
  onOptimize 
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>(stops);

  const totalExpectedVolume = stops.reduce((sum, stop) => 
    sum + (stop.expected_volume_kg || 0), 0
  );

  const estimatedDuration = stops.length * 15; // 15 minutes per stop average

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    
    // Simple optimization: Sort by priority, then by expected volume
    const priorityOrder = { 'confirmed': 0, 'high': 1, 'medium': 2, 'low': 3, 'skip': 4 };
    
    const optimized = [...stops].sort((a, b) => {
      // First by priority
      const priorityA = priorityOrder[a.collection_priority as keyof typeof priorityOrder] ?? 2;
      const priorityB = priorityOrder[b.collection_priority as keyof typeof priorityOrder] ?? 2;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Then by expected volume (descending)
      return (b.expected_volume_kg || 0) - (a.expected_volume_kg || 0);
    }).map((stop, index) => ({
      ...stop,
      route_sequence: index + 1,
      estimated_time_minutes: 15 + (stop.expected_volume_kg || 0) * 0.5, // More time for larger volumes
    }));

    setTimeout(() => {
      setOptimizedRoute(optimized);
      setIsOptimizing(false);
      if (onOptimize) {
        onOptimize(optimized);
      }
    }, 1500); // Simulate optimization time
  };

  const openInGoogleMaps = () => {
    const addresses = optimizedRoute
      .map(stop => `${stop.restaurant.name}, ${stop.restaurant.township}, Yangon`)
      .join(' / ');
    
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(addresses)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Route Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span>Route Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stops.length}</div>
              <div className="text-sm text-muted-foreground">Stops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalExpectedVolume}kg</div>
              <div className="text-sm text-muted-foreground">Expected Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{estimatedDuration}min</div>
              <div className="text-sm text-muted-foreground">Est. Duration</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
              className="flex-1"
            >
              <Route className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
            </Button>
            <Button 
              variant="outline"
              onClick={openInGoogleMaps}
              disabled={optimizedRoute.length === 0}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Open in Maps
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Route List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Optimized Route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizedRoute.map((stop, index) => (
              <div key={stop.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{stop.restaurant.name}</div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{stop.restaurant.township}</span>
                    {stop.expected_volume_kg && (
                      <>
                        <span>•</span>
                        <span>{stop.expected_volume_kg}kg</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <UcoStatusBadge status={stop.uco_status as any} size="sm" />
                  <PriorityBadge priority={stop.collection_priority as any} size="sm" />
                </div>
                
                {stop.estimated_time_minutes && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {stop.estimated_time_minutes}min
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
