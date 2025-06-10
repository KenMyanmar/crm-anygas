
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck } from 'lucide-react';
import { UcoCollectionItem } from '@/types/ucoCollection';

interface CollectionItemsListProps {
  items: UcoCollectionItem[] | undefined;
  itemsLoading: boolean;
  isOwner: boolean;
  onAddRestaurants: () => void;
}

export const CollectionItemsList = ({
  items,
  itemsLoading,
  isOwner,
  onAddRestaurants
}: CollectionItemsListProps) => {
  const totalExpectedVolume = items?.reduce((sum, item) => sum + (item.expected_volume_kg || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collection Stops ({items?.length || 0})</span>
          <Badge variant="outline">
            Total Expected: {totalExpectedVolume}kg
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {itemsLoading ? (
          <div className="text-center py-8">Loading collection items...</div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items
              .sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0))
              .map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.restaurant?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.restaurant?.township} • {item.restaurant?.address}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline">{item.collection_priority}</Badge>
                  <Badge variant="secondary">{item.uco_status?.replace('_', ' ')}</Badge>
                  {item.expected_volume_kg && (
                    <Badge>{item.expected_volume_kg}kg</Badge>
                  )}
                </div>
              </div>
            ))}
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
