
import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Route, 
  Clock, 
  Navigation, 
  Eye, 
  Globe,
  Map as MapIcon,
  Satellite,
  AlertTriangle
} from 'lucide-react';
import { VisitTask } from '@/types/visits';

interface GoogleMapsVisitRouteProps {
  tasks: VisitTask[];
}

const GoogleMapsVisitRoute = ({ tasks }: GoogleMapsVisitRouteProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  // Check if we have an API key in localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('google_maps_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
      initializeMap(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('google_maps_api_key', apiKey);
      setShowApiKeyInput(false);
      initializeMap(apiKey);
    }
  };

  const initializeMap = async (googleApiKey: string) => {
    if (!mapRef.current || tasks.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const loader = new Loader({
        apiKey: googleApiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      const google = await loader.load();
      
      // Initialize map
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 16.8661, lng: 96.1951 }, // Yangon center
        mapTypeId: mapType,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Initialize services
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsRendererInstance.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);

      // Add markers and calculate route
      await addMarkersAndRoute(mapInstance, directionsServiceInstance, directionsRendererInstance);

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Google Maps:', err);
      setError('Failed to load Google Maps. Please check your API key.');
      setIsLoading(false);
    }
  };

  const addMarkersAndRoute = async (
    mapInstance: google.maps.Map,
    directionsServiceInstance: google.maps.DirectionsService,
    directionsRendererInstance: google.maps.DirectionsRenderer
  ) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Create waypoints for route calculation
    const waypoints: google.maps.DirectionsWaypoint[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const position = await geocodeAddress(task.restaurant?.address || task.restaurant?.name || '');
      
      if (position) {
        // Create marker
        const marker = new google.maps.Marker({
          position,
          map: mapInstance,
          title: task.restaurant?.name,
          label: {
            text: (i + 1).toString(),
            color: 'white',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: getStatusColor(task.status || 'PLANNED'),
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(task, i + 1),
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        // Add click listener for street view
        marker.addListener('dblclick', () => {
          showStreetView(mapInstance, position);
        });

        newMarkers.push(marker);
        bounds.extend(position);

        // Add to waypoints for route (except first and last)
        if (i > 0 && i < tasks.length - 1) {
          waypoints.push({ location: position, stopover: true });
        }
      }
    }

    setMarkers(newMarkers);

    // Calculate and display route if we have multiple locations
    if (newMarkers.length > 1) {
      try {
        const origin = newMarkers[0].getPosition()!;
        const destination = newMarkers[newMarkers.length - 1].getPosition()!;

        const request: google.maps.DirectionsRequest = {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsServiceInstance.route(request, (result, status) => {
          if (status === 'OK' && result) {
            directionsRendererInstance.setDirections(result);
            
            // Extract route info
            const route = result.routes[0];
            const leg = route.legs[0];
            setRouteInfo({
              distance: route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0) / 1000 + ' km',
              duration: route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) / 60 + ' min',
            });
          } else {
            console.error('Directions request failed:', status);
          }
        });
      } catch (err) {
        console.error('Error calculating route:', err);
      }
    } else {
      // If only one location, just fit bounds
      mapInstance.fitBounds(bounds);
    }
  };

  const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
    if (!window.google) return null;

    const geocoder = new google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({ 
        address: `${address}, Yangon, Myanmar`,
        region: 'MM'
      });
      
      if (result.results[0]) {
        return result.results[0].geometry.location;
      }
    } catch (err) {
      console.error('Geocoding failed for:', address, err);
    }
    
    return null;
  };

  const createInfoWindowContent = (task: VisitTask, sequence: number): string => {
    return `
      <div style="padding: 8px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
          ${sequence}. ${task.restaurant?.name || 'Unknown Restaurant'}
        </h3>
        <div style="margin-bottom: 4px; color: #6b7280; font-size: 14px;">
          <strong>Township:</strong> ${task.restaurant?.township || 'N/A'}
        </div>
        <div style="margin-bottom: 4px; color: #6b7280; font-size: 14px;">
          <strong>Contact:</strong> ${task.restaurant?.contact_person || 'N/A'}
        </div>
        <div style="margin-bottom: 4px; color: #6b7280; font-size: 14px;">
          <strong>Status:</strong> <span style="background: ${getStatusColor(task.status || 'PLANNED')}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${task.status || 'PLANNED'}</span>
        </div>
        <div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">
          <strong>Estimated Duration:</strong> ${task.estimated_duration_minutes || 60} min
        </div>
        <div style="font-size: 12px; color: #9ca3af;">
          Double-click marker for Street View
        </div>
      </div>
    `;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'VISITED': return '#10b981';
      case 'PLANNED': return '#3b82f6';
      case 'RESCHEDULED': return '#f59e0b';
      case 'CANCELED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const showStreetView = (mapInstance: google.maps.Map, position: google.maps.LatLng) => {
    const streetViewPanorama = mapInstance.getStreetView();
    streetViewPanorama.setPosition(position);
    streetViewPanorama.setVisible(true);
    setStreetView(streetViewPanorama);
  };

  const changeMapType = (newMapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(newMapType);
    if (map) {
      map.setMapTypeId(newMapType);
    }
  };

  const totalDuration = tasks.reduce((sum, task) => sum + (task.estimated_duration_minutes || 60), 0);

  if (showApiKeyInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5" />
            <span>Google Maps Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              To enable Google Maps route visualization, please enter your Google Maps API key.
              You can get one from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a>.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google Maps API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Maps API key"
              />
              <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                Initialize Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Visit Route Map</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={mapType === 'roadmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeMapType('roadmap')}
            >
              <MapIcon className="h-4 w-4 mr-1" />
              Road
            </Button>
            <Button
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeMapType('satellite')}
            >
              <Satellite className="h-4 w-4 mr-1" />
              Satellite
            </Button>
            <Button
              variant={mapType === 'hybrid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeMapType('hybrid')}
            >
              <Globe className="h-4 w-4 mr-1" />
              Hybrid
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowApiKeyInput(true)}
                className="ml-2 p-0 h-auto"
              >
                Update API Key
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '384px' }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading Google Maps...</p>
                </div>
              </div>
            )}
          </div>

          {/* Route Summary */}
          {routeInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{tasks.length} Stops</p>
                  <p className="text-xs text-blue-600">Total visits</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <Route className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{routeInfo.distance}</p>
                  <p className="text-xs text-green-600">Total distance</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">{Math.round(totalDuration / 60)}h {totalDuration % 60}m</p>
                  <p className="text-xs text-orange-600">Est. visit time</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p><strong>💡 Map Instructions:</strong></p>
              <p>• Click markers to see restaurant details</p>
              <p>• Double-click markers to open Street View</p>
              <p>• Use map controls to zoom and navigate</p>
              <p>• Switch between Road, Satellite, and Hybrid views</p>
              <p>• Blue route shows optimized travel path</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsVisitRoute;
