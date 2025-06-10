
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';

interface UcoStatusSelectProps {
  value: UcoCollectionItem['uco_status'];
  onValueChange: (value: UcoCollectionItem['uco_status']) => void;
}

export const UcoStatusSelect = ({ value, onValueChange }: UcoStatusSelectProps) => {
  const statusOptions: Array<{ value: UcoCollectionItem['uco_status']; label: string }> = [
    { value: 'not_assessed', label: 'Not Assessed' },
    { value: 'have_uco', label: 'Have UCO' },
    { value: 'no_uco_reuse_staff', label: 'No UCO (Reuse/Staff)' },
    { value: 'no_uco_not_ready', label: 'No UCO (Not Ready)' },
    { value: 'shop_closed', label: 'Shop Closed' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto min-w-[140px]">
        <SelectValue>
          <UcoStatusBadge status={value} size="sm" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center space-x-2">
              <UcoStatusBadge status={option.value} size="sm" />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
