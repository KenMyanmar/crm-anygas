
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Clock, Globe } from 'lucide-react';
import { VisitTask } from '@/types/visits';
import GoogleMapsVisitRoute from './GoogleMapsVisitRoute';

interface VisitPlanMapPreviewProps {
  tasks: VisitTask[];
}

const VisitPlanMapPreview = ({ tasks }: VisitPlanMapPreviewProps) => {
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  // Group tasks by township for the simple view
  const groupedByTownship = tasks.reduce((acc, task) => {
    const township = task.restaurant?.township || 'Unknown';
    if (!acc[township]) {
      acc[township] = [];
    }
    acc[township].push(task);
    return acc;
  }, {} as Record<string, VisitTask[]>);

  const townships = Object.keys(groupedByTownship);
  const totalDuration = tasks.reduce((sum, task) => sum + (task.estimated_duration_minutes || 60), 0);

  // If Google Maps is enabled, show the full Google Maps component
  if (useGoogleMaps) {
    return <GoogleMapsVisitRoute tasks={tasks} />;
  }

  // Show simple preview with option to upgrade to Google Maps
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Visit Route Preview</span>
          </CardTitle>
          <Button
            onClick={() => setUseGoogleMaps(true)}
            className="flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Enable Google Maps</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Township Distribution View */}
          <div className="relative bg-gray-50 rounded-lg p-4 h-64 border-2 border-dashed border-gray-200">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Simple Route Preview (Township Distribution)
            </div>
            
            {/* Mock visualization for townships */}
            <div className="absolute inset-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                {townships.slice(0, 6).map((township, index) => {
                  const taskCount = groupedByTownship[township].length;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'];
                  
                  return (
                    <div key={township} className="flex flex-col items-center justify-center text-center">
                      <div className={`w-8 h-8 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white text-sm font-bold mb-2`}>
                        {taskCount}
                      </div>
                      <p className="text-xs font-medium text-gray-700 truncate w-full">{township}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Route Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{townships.length} Townships</p>
                <p className="text-xs text-blue-600">Coverage area</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <Route className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{tasks.length} Stops</p>
                <p className="text-xs text-green-600">Total visits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">{Math.round(totalDuration / 60)}h {totalDuration % 60}m</p>
                <p className="text-xs text-orange-600">Estimated time</p>
              </div>
            </div>
          </div>

          {/* Township Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Township Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(groupedByTownship).map(([township, tasks]) => {
                const colors = ['border-blue-500 text-blue-500', 'border-green-500 text-green-500', 'border-purple-500 text-purple-500', 'border-orange-500 text-orange-500', 'border-red-500 text-red-500', 'border-yellow-500 text-yellow-500'];
                const colorIndex = townships.indexOf(township) % colors.length;
                
                return (
                  <Badge
                    key={township}
                    variant="outline"
                    className={`flex items-center space-x-1 ${colors[colorIndex]}`}
                  >
                    <span>{township}</span>
                    <span className="text-xs">({tasks.length})</span>
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
            💡 Enable Google Maps for full route visualization with street view, hybrid view, and turn-by-turn directions.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitPlanMapPreview;
