
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Truck } from 'lucide-react';

interface TruckCapacityFieldProps {
  value: number;
  onChange: (value: number) => void;
}

export const TruckCapacityField = ({ value, onChange }: TruckCapacityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="truck_capacity">Truck Capacity (kg)</Label>
      <div className="relative">
        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="truck_capacity"
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="500"
          className="pl-10"
          min="1"
        />
      </div>
    </div>
  );
};
