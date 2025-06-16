import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { PriorityBadge } from '@/components/uco/PriorityBadge';
import { Phone, MapPin, ClipboardList, CheckCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { UcoCollectionDialog } from './UcoCollectionDialog';
import { UcoStatusSelect } from './UcoStatusSelect';
import { PrioritySelect } from './PrioritySelect';
import { NearbyRestaurantFinder } from '@/components/uco/NearbyRestaurantFinder';
import { toast } from 'sonner';

interface UcoCollectionTableProps {
  items: UcoCollectionItem[];
  isOwner: boolean;
  onUpdateItem: (itemId: string, updates: Partial<UcoCollectionItem>) => Promise<void>;
}

export const UcoCollectionTable = ({ items, isOwner, onUpdateItem }: UcoCollectionTableProps) => {
  const [selectedItem, setSelectedItem] = useState<UcoCollectionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  const [nearbySearchLocation, setNearbySearchLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);

  const handleRowClick = (item: UcoCollectionItem) => {
    if (isOwner) {
      setSelectedItem(item);
      setIsDialogOpen(true);
    }
  };

  const handleStatusUpdate = async (itemId: string, status: UcoCollectionItem['uco_status']) => {
    if (updatingItems.has(itemId)) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await onUpdateItem(itemId, { uco_status: status });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handlePriorityUpdate = async (itemId: string, priority: UcoCollectionItem['collection_priority']) => {
    if (updatingItems.has(itemId)) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await onUpdateItem(itemId, { collection_priority: priority });
      toast.success('Priority updated successfully');
    } catch (error) {
      toast.error('Failed to update priority');
      console.error('Error updating priority:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handlePhoneCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleNavigation = (address?: string, name?: string, restaurant?: any) => {
    if (address || name) {
      const query = encodeURIComponent(`${name || ''} ${address || ''}`.trim());
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  const handleFindNearby = async (item: UcoCollectionItem) => {
    // Try to get coordinates from restaurant address using geocoding
    if (item.restaurant?.address || item.restaurant?.name) {
      try {
        const query = encodeURIComponent(`${item.restaurant.name} ${item.restaurant.address || ''} ${item.restaurant.township || ''}`);
        
        // For demo purposes, we'll use approximate coordinates
        // In production, you'd want to geocode the address first
        const location = {
          lat: 16.8661 + (Math.random() - 0.5) * 0.1, // Yangon area with some variance
          lng: 96.1951 + (Math.random() - 0.5) * 0.1,
          name: item.restaurant.name
        };
        
        setNearbySearchLocation(location);
        setShowNearbyFinder(true);
      } catch (error) {
        toast.error('Could not determine location for this restaurant');
      }
    } else {
      toast.error('Restaurant location information is not available');
    }
  };

  const handleRestaurantsAdded = () => {
    toast.success('New restaurants added successfully!');
    // Optionally refresh the data or update the parent component
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No collection items found
      </div>
    );
  }

  const sortedItems = items.sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0));

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>UCO Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Expected Vol.</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => (
            <TableRow 
              key={item.id} 
              className={`${isOwner ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors ${item.completed_at ? 'bg-green-50' : ''}`}
              onClick={() => handleRowClick(item)}
            >
              <TableCell>
                <div className={`flex items-center justify-center w-8 h-8 ${item.completed_at ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'} rounded-full text-sm font-medium`}>
                  {item.completed_at ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.restaurant?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.restaurant?.township}
                    {item.restaurant?.address && ` • ${item.restaurant.address}`}
                  </div>
                  {item.restaurant?.contact_person && (
                    <div className="text-xs text-muted-foreground">
                      Contact: {item.restaurant.contact_person}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {isOwner ? (
                  <UcoStatusSelect
                    value={item.uco_status}
                    onValueChange={(status) => handleStatusUpdate(item.id, status)}
                  />
                ) : (
                  <UcoStatusBadge status={item.uco_status} size="sm" />
                )}
                {updatingItems.has(item.id) && (
                  <div className="text-xs text-muted-foreground mt-1">Updating...</div>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {isOwner ? (
                  <PrioritySelect
                    value={item.collection_priority}
                    onValueChange={(priority) => handlePriorityUpdate(item.id, priority)}
                  />
                ) : (
                  <PriorityBadge priority={item.collection_priority} size="sm" />
                )}
              </TableCell>
              <TableCell>
                {item.expected_volume_kg ? (
                  <Badge variant="outline">{item.expected_volume_kg}kg</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {item.actual_volume_kg ? (
                  <div className="space-y-1">
                    <Badge variant="default">{item.actual_volume_kg}kg</Badge>
                    {item.price_per_kg && (
                      <div className="text-xs text-muted-foreground">
                        {item.price_per_kg} MMK/kg
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-1">
                  {item.restaurant?.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePhoneCall(item.restaurant?.phone)}
                      className="h-8 w-8 p-0"
                      title="Call Restaurant"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation(item.restaurant?.address, item.restaurant?.name, item.restaurant)}
                    className="h-8 w-8 p-0"
                    title="Navigate to Restaurant"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  {isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRowClick(item)}
                        className="h-8 w-8 p-0"
                        title="View Collection Details"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFindNearby(item)}
                        className="h-8 w-8 p-0"
                        title="Find Nearby Restaurants"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedItem && (
        <UcoCollectionDialog
          item={selectedItem}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onUpdate={onUpdateItem}
        />
      )}

      <NearbyRestaurantFinder
        open={showNearbyFinder}
        onOpenChange={setShowNearbyFinder}
        currentLocation={nearbySearchLocation}
        onRestaurantsAdded={handleRestaurantsAdded}
      />
    </>
  );
};
