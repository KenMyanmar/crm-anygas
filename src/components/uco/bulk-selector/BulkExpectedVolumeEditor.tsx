
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Zap } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  avg_uco_volume_kg?: number;
}

interface BulkExpectedVolumeEditorProps {
  selectedRestaurants: Restaurant[];
  expectedVolumes: Record<string, number>;
  onExpectedVolumesChange: (volumes: Record<string, number>) => void;
}

export const BulkExpectedVolumeEditor = ({
  selectedRestaurants,
  expectedVolumes,
  onExpectedVolumesChange
}: BulkExpectedVolumeEditorProps) => {
  const [bulkVolume, setBulkVolume] = useState('');

  const handleBulkApply = () => {
    const volume = parseFloat(bulkVolume);
    if (isNaN(volume) || volume <= 0) return;

    const newVolumes = { ...expectedVolumes };
    selectedRestaurants.forEach(restaurant => {
      newVolumes[restaurant.id] = volume;
    });
    onExpectedVolumesChange(newVolumes);
  };

  const handleSmartSuggestions = () => {
    const newVolumes = { ...expectedVolumes };
    selectedRestaurants.forEach(restaurant => {
      if (restaurant.avg_uco_volume_kg) {
        newVolumes[restaurant.id] = restaurant.avg_uco_volume_kg;
      }
    });
    onExpectedVolumesChange(newVolumes);
  };

  const totalExpectedVolume = selectedRestaurants.reduce((total, restaurant) => {
    return total + (expectedVolumes[restaurant.id] || 0);
  }, 0);

  const restaurantsWithSuggestions = selectedRestaurants.filter(r => r.avg_uco_volume_kg);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Expected Volume Planning</span>
          <Badge variant="outline">{selectedRestaurants.length} restaurants</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bulk Apply Section */}
          <div className="space-y-2">
            <Label htmlFor="bulk-volume">Apply Same Volume to All</Label>
            <div className="flex space-x-2">
              <Input
                id="bulk-volume"
                type="number"
                placeholder="Volume (kg)"
                value={bulkVolume}
                onChange={(e) => setBulkVolume(e.target.value)}
                min="0"
                step="0.1"
              />
              <Button onClick={handleBulkApply} disabled={!bulkVolume}>
                Apply
              </Button>
            </div>
          </div>

          {/* Smart Suggestions Section */}
          <div className="space-y-2">
            <Label>Smart Suggestions</Label>
            <Button 
              onClick={handleSmartSuggestions}
              variant="outline"
              className="w-full"
              disabled={restaurantsWithSuggestions.length === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Use Historical Averages
              {restaurantsWithSuggestions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {restaurantsWithSuggestions.length} available
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Expected Volume:</span>
            <span className="text-lg font-bold text-primary">
              {totalExpectedVolume.toFixed(1)} kg
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Average per restaurant: {(totalExpectedVolume / Math.max(selectedRestaurants.length, 1)).toFixed(1)} kg
          </div>
        </div>

        {/* Individual Restaurant Volumes */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedRestaurants.map(restaurant => (
            <div key={restaurant.id} className="flex justify-between items-center py-1">
              <span className="text-sm truncate flex-1">{restaurant.name}</span>
              <div className="flex items-center space-x-2">
                {restaurant.avg_uco_volume_kg && (
                  <Badge variant="outline" className="text-xs">
                    Avg: {restaurant.avg_uco_volume_kg}kg
                  </Badge>
                )}
                <span className="text-sm font-medium w-16 text-right">
                  {expectedVolumes[restaurant.id]?.toFixed(1) || '0.0'} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
