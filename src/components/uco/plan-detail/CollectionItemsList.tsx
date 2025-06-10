
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck } from 'lucide-react';
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
  const { updateItem } = useUcoItems(planId);
  
  const totalExpectedVolume = items?.reduce((sum, item) => sum + (item.expected_volume_kg || 0), 0) || 0;
  const totalCollectedVolume = items?.reduce((sum, item) => sum + (item.actual_volume_kg || 0), 0) || 0;
  const completedItems = items?.filter(item => item.completed_at).length || 0;

  const handleUpdateItem = async (itemId: string, updates: Partial<UcoCollectionItem>) => {
    try {
      await updateItem.mutateAsync({ id: itemId, ...updates });
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collection Stops ({items?.length || 0})</span>
          <div className="flex space-x-2">
            <Badge variant="outline">
              Expected: {totalExpectedVolume}kg
            </Badge>
            {totalCollectedVolume > 0 && (
              <Badge variant="default">
                Collected: {totalCollectedVolume}kg
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
          <div className="text-center py-8">Loading collection items...</div>
        ) : items && items.length > 0 ? (
          <UcoCollectionTable
            items={items}
            isOwner={isOwner}
            onUpdateItem={handleUpdateItem}
          />
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
