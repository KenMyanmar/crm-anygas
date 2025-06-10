
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PlanNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const PlanNameField = ({ value, onChange }: PlanNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="plan_name">Plan Name *</Label>
      <Input
        id="plan_name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Yankin Township UCO Collection"
        required
      />
    </div>
  );
};
