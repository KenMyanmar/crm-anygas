
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { UcoCollectionTable } from '@/components/uco/collection/UcoCollectionTable';
import { useUcoItems } from '@/hooks/useUcoItems';
import { toast } from 'sonner';

interface CollectionItemsListProps {
  items: UcoCollectionItem[] | undefined;
  itemsLoading: boolean;
  isOwner: boolean;
  onAddRestaurants: () => void;
  planId?: string;
}

export const CollectionItemsList = ({
  items,
  itemsLoading,
  isOwner,
  onAddRestaurants,
  planId
}: CollectionItemsListProps) => {
  const { updateItem, error } = useUcoItems(planId);
  
  const totalExpectedVolume = items?.reduce((sum, item) => sum + (item.expected_volume_kg || 0), 0) || 0;
  const totalCollectedVolume = items?.reduce((sum, item) => sum + (item.actual_volume_kg || 0), 0) || 0;
  const completedItems = items?.filter(item => item.completed_at).length || 0;
  const totalRevenue = items?.reduce((sum, item) => {
    return sum + ((item.actual_volume_kg || 0) * (item.price_per_kg || 0));
  }, 0) || 0;

  const handleUpdateItem = async (itemId: string, updates: Partial<UcoCollectionItem>) => {
    try {
      await updateItem.mutateAsync({ id: itemId, ...updates });
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error Loading Collection Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Failed to load collection items. Please try refreshing the page.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collection Stops ({items?.length || 0})</span>
          <div className="flex space-x-2">
            <Badge variant="outline">
              Expected: {totalExpectedVolume.toFixed(1)}kg
            </Badge>
            {totalCollectedVolume > 0 && (
              <Badge variant="default">
                Collected: {totalCollectedVolume.toFixed(1)}kg
              </Badge>
            )}
            {totalRevenue > 0 && (
              <Badge variant="secondary">
                Revenue: {totalRevenue.toLocaleString()} MMK
              </Badge>
            )}
            {completedItems > 0 && (
              <Badge variant="secondary">
                Completed: {completedItems}/{items?.length || 0}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {itemsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading collection items...</p>
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4">
            {/* Collection Progress */}
            {items.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Stops</div>
                    <div className="text-2xl font-bold">{items.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                  </div>
                  <div>
                    <div className="font-medium">Collection Rate</div>
                    <div className="text-2xl font-bold">
                      {items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Avg Volume</div>
                    <div className="text-2xl font-bold">
                      {completedItems > 0 ? (totalCollectedVolume / completedItems).toFixed(1) : 0}kg
                    </div>
                  </div>
                </div>
                {totalCollectedVolume > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Collection Progress:</span>
                      <span>{totalCollectedVolume.toFixed(1)}kg of {totalExpectedVolume.toFixed(1)}kg expected</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${totalExpectedVolume > 0 ? Math.min((totalCollectedVolume / totalExpectedVolume) * 100, 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collection Table */}
            <UcoCollectionTable
              items={items}
              isOwner={isOwner}
              onUpdateItem={handleUpdateItem}
            />

            {/* Add More Restaurants Button */}
            {isOwner && (
              <div className="flex justify-center pt-4">
                <Button onClick={onAddRestaurants} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Restaurants
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Restaurants Added</h3>
            <p className="text-muted-foreground mb-4">
              Add restaurants to this collection plan to get started
            </p>
            {isOwner && (
              <Button onClick={onAddRestaurants}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurants
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
