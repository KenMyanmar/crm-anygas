
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { useUcoCollectionItems } from '@/hooks/useUcoCollectionPlans';
import { UcoCollectionItem, StatusFormData, UcoStatus } from '@/types/uco';
import { StatusSelector } from './mobile-updater/StatusSelector';
import { CollectionDetailsForm } from './mobile-updater/CollectionDetailsForm';
import { ContactInfo } from './mobile-updater/ContactInfo';
import { RestaurantHeader } from './mobile-updater/RestaurantHeader';

interface MobileStatusUpdaterProps {
  item: UcoCollectionItem;
  onUpdate?: () => void;
}

export const MobileStatusUpdater: React.FC<MobileStatusUpdaterProps> = ({ 
  item, 
  onUpdate 
}) => {
  const { updateItem } = useUcoCollectionItems();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<StatusFormData>({
    uco_status: item.uco_status,
    actual_volume_kg: '',
    price_per_kg: '',
    quality_score: '',
    driver_notes: '',
  });

  const handleStatusUpdate = async (newStatus: UcoStatus) => {
    setIsUpdating(true);
    try {
      await updateItem.mutateAsync({
        id: item.id,
        uco_status: newStatus,
        visit_time: new Date().toISOString(),
        ...formData,
        actual_volume_kg: formData.actual_volume_kg ? parseFloat(formData.actual_volume_kg) : undefined,
        price_per_kg: formData.price_per_kg ? parseFloat(formData.price_per_kg) : undefined,
        quality_score: formData.quality_score ? parseInt(formData.quality_score) : undefined,
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = (status: UcoStatus) => {
    setFormData({ ...formData, uco_status: status });
    handleStatusUpdate(status);
  };

  return (
    <Card className="w-full">
      <RestaurantHeader
        restaurant={item.restaurant}
        routeSequence={item.route_sequence}
        currentStatus={formData.uco_status}
        priority={item.collection_priority}
      />
      
      <CardContent className="space-y-4">
        <StatusSelector
          currentStatus={formData.uco_status}
          onStatusSelect={handleQuickUpdate}
          isUpdating={isUpdating}
        />

        <CollectionDetailsForm
          formData={formData}
          onFormDataChange={setFormData}
          showDetails={formData.uco_status === 'have_uco'}
        />

        <div>
          <Label htmlFor="notes" className="text-sm">Driver Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about the visit..."
            value={formData.driver_notes}
            onChange={(e) => setFormData({ ...formData, driver_notes: e.target.value })}
            className="h-16 text-sm"
          />
        </div>

        <ContactInfo
          restaurant={item.restaurant}
          expectedVolume={item.expected_volume_kg}
        />

        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={() => handleStatusUpdate(formData.uco_status)}
            disabled={isUpdating}
            className="flex-1"
            size="sm"
          >
            <Clock className="h-3 w-3 mr-1" />
            {isUpdating ? 'Updating...' : 'Complete Visit'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`tel:${item.restaurant.phone}`, '_self')}
            disabled={!item.restaurant.phone}
          >
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
