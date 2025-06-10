
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { PriorityBadge } from '@/components/uco/PriorityBadge';
import { Phone, MapPin, MessageSquare, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { UcoCollectionDialog } from './UcoCollectionDialog';
import { UcoStatusSelect } from './UcoStatusSelect';
import { PrioritySelect } from './PrioritySelect';

interface UcoCollectionTableProps {
  items: UcoCollectionItem[];
  isOwner: boolean;
  onUpdateItem: (itemId: string, updates: Partial<UcoCollectionItem>) => Promise<void>;
}

export const UcoCollectionTable = ({ items, isOwner, onUpdateItem }: UcoCollectionTableProps) => {
  const [selectedItem, setSelectedItem] = useState<UcoCollectionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRowClick = (item: UcoCollectionItem) => {
    if (isOwner) {
      setSelectedItem(item);
      setIsDialogOpen(true);
    }
  };

  const handleStatusUpdate = async (itemId: string, status: UcoCollectionItem['uco_status']) => {
    await onUpdateItem(itemId, { uco_status: status });
  };

  const handlePriorityUpdate = async (itemId: string, priority: UcoCollectionItem['collection_priority']) => {
    await onUpdateItem(itemId, { collection_priority: priority });
  };

  const handlePhoneCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleNavigation = (address?: string, name?: string) => {
    if (address || name) {
      const query = encodeURIComponent(`${name || ''} ${address || ''}`.trim());
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
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
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Expected Vol.</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => (
            <TableRow 
              key={item.id} 
              className={`${isOwner ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
              onClick={() => handleRowClick(item)}
            >
              <TableCell>
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {index + 1}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.restaurant?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.restaurant?.township}
                    {item.restaurant?.address && ` • ${item.restaurant.address}`}
                  </div>
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
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-1">
                  {item.restaurant?.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePhoneCall(item.restaurant?.phone)}
                      className="h-8 w-8 p-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation(item.restaurant?.address, item.restaurant?.name)}
                    className="h-8 w-8 p-0"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRowClick(item)}
                      className="h-8 w-8 p-0"
                    >
                      <ClipboardList className="h-4 w-4" />
                    </Button>
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
    </>
  );
};
