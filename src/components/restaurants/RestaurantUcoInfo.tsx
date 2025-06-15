
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { Droplets, TrendingUp, Calendar, History, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface UcoCollectionHistory {
  id: string;
  collection_date: string;
  volume_kg: number;
  price_per_kg: number;
  total_amount: number;
  quality_score?: number;
}

interface RestaurantUcoInfoProps {
  restaurant: {
    id: string;
    name: string;
    uco_supplier_status?: string;
    avg_uco_volume_kg?: number;
    uco_price_per_kg?: number;
    last_uco_collection_date?: string;
  };
  ucoHistory?: UcoCollectionHistory[];
  onAddToCollection?: () => void;
}

export const RestaurantUcoInfo = ({ 
  restaurant, 
  ucoHistory = [],
  onAddToCollection 
}: RestaurantUcoInfoProps) => {
  const totalCollected = ucoHistory.reduce((sum, h) => sum + h.volume_kg, 0);
  const totalRevenue = ucoHistory.reduce((sum, h) => sum + h.total_amount, 0);
  const avgQuality = ucoHistory.length > 0 
    ? ucoHistory.filter(h => h.quality_score).reduce((sum, h) => sum + (h.quality_score || 0), 0) / 
      ucoHistory.filter(h => h.quality_score).length
    : 0;

  return (
    <div className="space-y-6">
      {/* UCO Status & Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span>UCO Supplier Information</span>
            </span>
            {onAddToCollection && (
              <Button onClick={onAddToCollection} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add to Collection
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Supplier Status</label>
              <UcoStatusBadge status={restaurant.uco_supplier_status as any || 'not_assessed'} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Average Volume</label>
              <div className="flex items-center space-x-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">
                  {restaurant.avg_uco_volume_kg?.toFixed(1) || '0'} kg
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Current Price</label>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold">
                  {restaurant.uco_price_per_kg?.toFixed(0) || '0'} MMK/kg
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Collection</label>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {restaurant.last_uco_collection_date 
                    ? format(new Date(restaurant.last_uco_collection_date), 'MMM dd, yyyy')
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Statistics */}
      {ucoHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Collection Statistics</span>
              <Badge variant="outline">{ucoHistory.length} collections</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalCollected.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue (MMK)</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {(totalCollected / ucoHistory.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Volume/Collection</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {avgQuality > 0 ? avgQuality.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Quality Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collection History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Collection History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ucoHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No collection history available</p>
              <p className="text-sm">This restaurant hasn't been part of any UCO collections yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ucoHistory.slice(0, 10).map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(new Date(collection.collection_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {collection.volume_kg}kg @ {collection.price_per_kg} MMK/kg
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-green-600">
                      {collection.total_amount.toLocaleString()} MMK
                    </div>
                    {collection.quality_score && (
                      <Badge variant="outline" className="text-xs">
                        Quality: {collection.quality_score}/10
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {ucoHistory.length > 10 && (
                <div className="text-center py-2">
                  <Button variant="outline" size="sm">
                    View All {ucoHistory.length} Collections
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
