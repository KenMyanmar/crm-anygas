
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Users } from 'lucide-react';

interface DateAndDriverFieldsProps {
  planDate: string;
  driverName: string;
  onPlanDateChange: (value: string) => void;
  onDriverNameChange: (value: string) => void;
}

export const DateAndDriverFields = ({
  planDate,
  driverName,
  onPlanDateChange,
  onDriverNameChange,
}: DateAndDriverFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="plan_date">Collection Date *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="plan_date"
            type="date"
            value={planDate}
            onChange={(e) => onPlanDateChange(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver_name">Driver Name</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="driver_name"
            value={driverName}
            onChange={(e) => onDriverNameChange(e.target.value)}
            placeholder="Enter driver name"
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};
