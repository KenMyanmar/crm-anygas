
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Clock } from 'lucide-react';
import { VisitTask } from '@/types/visits';

interface VisitPlanMapPreviewProps {
  tasks: VisitTask[];
}

const VisitPlanMapPreview = ({ tasks }: VisitPlanMapPreviewProps) => {
  const [groupedByTownship, setGroupedByTownship] = useState<Record<string, VisitTask[]>>({});

  useEffect(() => {
    const grouped = tasks.reduce((acc, task) => {
      const township = task.restaurant?.township || 'Unknown';
      if (!acc[township]) {
        acc[township] = [];
      }
      acc[township].push(task);
      return acc;
    }, {} as Record<string, VisitTask[]>);
    setGroupedByTownship(grouped);
  }, [tasks]);

  const townships = Object.keys(groupedByTownship);
  const totalDuration = tasks.reduce((sum, task) => sum + (task.estimated_duration_minutes || 60), 0);

  // Mock coordinates for townships (in a real app, you'd geocode these)
  const townshipCoordinates: Record<string, { x: number; y: number; color: string }> = {
    'Downtown': { x: 150, y: 120, color: '#3b82f6' },
    'Yangon': { x: 200, y: 100, color: '#ef4444' },
    'Mandalay': { x: 120, y: 80, color: '#10b981' },
    'Bahan': { x: 180, y: 140, color: '#f59e0b' },
    'Kamayut': { x: 100, y: 110, color: '#8b5cf6' },
    'Sanchaung': { x: 170, y: 90, color: '#ec4899' },
    'Unknown': { x: 160, y: 130, color: '#6b7280' }
  };

  const getCoordinatesForTownship = (township: string) => {
    return townshipCoordinates[township] || townshipCoordinates['Unknown'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5" />
          <span>Visit Route Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mock Map Visualization */}
          <div className="relative bg-gray-50 rounded-lg p-4 h-64 border-2 border-dashed border-gray-200">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Map Preview (Township Distribution)
            </div>
            
            {/* Township Markers */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
              {townships.map((township) => {
                const coords = getCoordinatesForTownship(township);
                const taskCount = groupedByTownship[township].length;
                
                return (
                  <g key={township}>
                    {/* Route lines between townships */}
                    {townships.length > 1 && (
                      <line
                        x1={coords.x}
                        y1={coords.y}
                        x2={getCoordinatesForTownship(townships[(townships.indexOf(township) + 1) % townships.length]).x}
                        y2={getCoordinatesForTownship(townships[(townships.indexOf(township) + 1) % townships.length]).y}
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    )}
                    
                    {/* Township marker */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={Math.max(8, taskCount * 3)}
                      fill={coords.color}
                      opacity="0.8"
                    />
                    
                    {/* Task count badge */}
                    <circle
                      cx={coords.x + 12}
                      cy={coords.y - 12}
                      r="8"
                      fill="white"
                      stroke={coords.color}
                      strokeWidth="2"
                    />
                    <text
                      x={coords.x + 12}
                      y={coords.y - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={coords.color}
                      fontWeight="bold"
                    >
                      {taskCount}
                    </text>
                    
                    {/* Township label */}
                    <text
                      x={coords.x}
                      y={coords.y + 25}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#374151"
                      fontWeight="500"
                    >
                      {township}
                    </text>
                  </g>
                );
              })}
            </svg>
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
                const coords = getCoordinatesForTownship(township);
                return (
                  <Badge
                    key={township}
                    variant="outline"
                    className="flex items-center space-x-1"
                    style={{ borderColor: coords.color, color: coords.color }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: coords.color }}
                    />
                    <span>{township}</span>
                    <span className="text-xs">({tasks.length})</span>
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
            💡 This is a simplified route preview. In a production app, this would show actual map locations with optimized routing.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitPlanMapPreview;
