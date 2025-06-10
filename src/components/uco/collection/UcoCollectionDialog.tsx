
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { UcoStatusSelect } from './UcoStatusSelect';
import { PrioritySelect } from './PrioritySelect';
import { Star, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UcoCollectionDialogProps {
  item: UcoCollectionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (itemId: string, updates: Partial<UcoCollectionItem>) => Promise<void>;
}

export const UcoCollectionDialog = ({ item, open, onOpenChange, onUpdate }: UcoCollectionDialogProps) => {
  const [formData, setFormData] = useState({
    uco_status: item.uco_status,
    collection_priority: item.collection_priority,
    actual_volume_kg: item.actual_volume_kg?.toString() || '',
    price_per_kg: item.price_per_kg?.toString() || '',
    quality_score: item.quality_score?.toString() || '',
    driver_notes: item.driver_notes || '',
    competitor_notes: item.competitor_notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updates: Partial<UcoCollectionItem> = {
        uco_status: formData.uco_status,
        collection_priority: formData.collection_priority,
        driver_notes: formData.driver_notes,
        competitor_notes: formData.competitor_notes,
        visit_time: new Date().toISOString(),
      };

      // Only include numeric fields if they have values
      if (formData.actual_volume_kg) {
        updates.actual_volume_kg = parseFloat(formData.actual_volume_kg);
      }
      if (formData.price_per_kg) {
        updates.price_per_kg = parseFloat(formData.price_per_kg);
      }
      if (formData.quality_score) {
        updates.quality_score = parseInt(formData.quality_score);
      }

      // Mark as completed if UCO was collected
      if (formData.uco_status === 'have_uco') {
        updates.completed_at = new Date().toISOString();
      }

      await onUpdate(item.id, updates);
      toast.success('Collection details updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update collection details');
      console.error('Error updating collection:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const showCollectionDetails = formData.uco_status === 'have_uco';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Collection Details - Stop #{item.route_sequence}</span>
            <div className="flex space-x-2">
              {item.restaurant?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePhoneCall(item.restaurant?.phone)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation(item.restaurant?.address, item.restaurant?.name)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Navigate
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{item.restaurant?.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {item.restaurant?.township && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.restaurant.township}</span>
                </div>
              )}
              {item.restaurant?.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{item.restaurant.phone}</span>
                </div>
              )}
              {item.restaurant?.address && (
                <div className="col-span-2">
                  <span>{item.restaurant.address}</span>
                </div>
              )}
              {item.restaurant?.contact_person && (
                <div className="col-span-2">
                  <strong>Contact:</strong> {item.restaurant.contact_person}
                </div>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>UCO Status</Label>
              <UcoStatusSelect
                value={formData.uco_status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, uco_status: value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Collection Priority</Label>
              <PrioritySelect
                value={formData.collection_priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, collection_priority: value }))}
              />
            </div>
          </div>

          {/* Collection Details (only show if UCO status is 'have_uco') */}
          {showCollectionDetails && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-green-700">✓ UCO Collection Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume Collected (kg) *</Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    value={formData.actual_volume_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, actual_volume_kg: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per kg (MMK) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1500"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_kg: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quality Score (1-5)</Label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        variant={formData.quality_score === score.toString() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, quality_score: score.toString() }))}
                        className="w-10 h-10 p-0"
                      >
                        <Star className={`h-4 w-4 ${formData.quality_score === score.toString() ? 'fill-current' : ''}`} />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver_notes">Collection Notes</Label>
              <Textarea
                id="driver_notes"
                placeholder="Any notes about the collection process, restaurant cooperation, etc..."
                value={formData.driver_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, driver_notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor_notes">Competitor Information</Label>
              <Textarea
                id="competitor_notes"
                placeholder="Information about competitors in the area, their prices, collection frequency..."
                value={formData.competitor_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, competitor_notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Collection Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
