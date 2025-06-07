
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Truck, Star } from 'lucide-react';
import { UcoStatusBadge } from './UcoStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useUcoCollectionItems } from '@/hooks/useUcoCollectionPlans';

interface UcoCollectionItem {
  id: string;
  restaurant: {
    name: string;
    township: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  };
  uco_status: string;
  collection_priority: string;
  expected_volume_kg?: number;
  route_sequence?: number;
}

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
  const [formData, setFormData] = useState({
    uco_status: item.uco_status,
    actual_volume_kg: '',
    price_per_kg: '',
    quality_score: '',
    driver_notes: '',
  });

  const statusOptions = [
    { value: 'have_uco', label: 'Have UCO', color: 'bg-green-100 text-green-800' },
    { value: 'no_uco_reuse_staff', label: 'NO UCO (Reuse/Staff)', color: 'bg-blue-100 text-blue-800' },
    { value: 'no_uco_not_ready', label: 'No UCO (Not Ready)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'shop_closed', label: 'Shop Closed', color: 'bg-red-100 text-red-800' },
    { value: 'not_assessed', label: 'Not Assessed', color: 'bg-gray-100 text-gray-600' },
  ];

  const handleStatusUpdate = async (newStatus: string) => {
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

  const handleQuickUpdate = (status: string) => {
    setFormData({ ...formData, uco_status: status });
    handleStatusUpdate(status);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{item.restaurant.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{item.restaurant.township}</span>
              {item.route_sequence && (
                <>
                  <Badge variant="outline" className="text-xs">
                    #{item.route_sequence}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <UcoStatusBadge status={formData.uco_status as any} size="sm" />
            <PriorityBadge priority={item.collection_priority as any} size="sm" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Status Buttons */}
        <div>
          <Label className="text-sm font-medium">Update Status</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusOptions.map((status) => (
              <Button
                key={status.value}
                variant={formData.uco_status === status.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickUpdate(status.value)}
                disabled={isUpdating}
                className="text-xs h-8"
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Collection Details (show only if have_uco) */}
        {formData.uco_status === 'have_uco' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="volume" className="text-sm">Volume (kg)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="25"
                value={formData.actual_volume_kg}
                onChange={(e) => setFormData({ ...formData, actual_volume_kg: e.target.value })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-sm">Price/kg</Label>
              <Input
                id="price"
                type="number"
                placeholder="1500"
                value={formData.price_per_kg}
                onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                className="h-8"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="quality" className="text-sm">Quality Score (1-5)</Label>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    variant={formData.quality_score === score.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, quality_score: score.toString() })}
                    className="w-8 h-8 p-0"
                  >
                    <Star className={`h-3 w-3 ${formData.quality_score === score.toString() ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
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

        {/* Contact Info */}
        {(item.restaurant.contact_person || item.restaurant.phone) && (
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground space-y-1">
              {item.restaurant.contact_person && (
                <div>Contact: {item.restaurant.contact_person}</div>
              )}
              {item.restaurant.phone && (
                <div>Phone: {item.restaurant.phone}</div>
              )}
              {item.expected_volume_kg && (
                <div>Expected: {item.expected_volume_kg}kg</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
