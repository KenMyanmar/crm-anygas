
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { StatusFormData } from '@/types/uco';

interface CollectionDetailsFormProps {
  formData: StatusFormData;
  onFormDataChange: (data: StatusFormData) => void;
  showDetails: boolean;
}

export const CollectionDetailsForm: React.FC<CollectionDetailsFormProps> = ({
  formData,
  onFormDataChange,
  showDetails
}) => {
  if (!showDetails) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="volume" className="text-sm">Volume (kg)</Label>
        <Input
          id="volume"
          type="number"
          placeholder="25"
          value={formData.actual_volume_kg}
          onChange={(e) => onFormDataChange({ ...formData, actual_volume_kg: e.target.value })}
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
          onChange={(e) => onFormDataChange({ ...formData, price_per_kg: e.target.value })}
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
              onClick={() => onFormDataChange({ ...formData, quality_score: score.toString() })}
              className="w-8 h-8 p-0"
            >
              <Star className={`h-3 w-3 ${formData.quality_score === score.toString() ? 'fill-current' : ''}`} />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
