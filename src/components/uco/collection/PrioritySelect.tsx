
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { PriorityBadge } from '@/components/uco/PriorityBadge';

interface PrioritySelectProps {
  value: UcoCollectionItem['collection_priority'];
  onValueChange: (value: UcoCollectionItem['collection_priority']) => void;
}

export const PrioritySelect = ({ value, onValueChange }: PrioritySelectProps) => {
  const priorityOptions: Array<{ value: UcoCollectionItem['collection_priority']; label: string }> = [
    { value: 'skip', label: 'Skip' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'confirmed', label: 'Confirmed' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto min-w-[120px]">
        <SelectValue>
          <PriorityBadge priority={value} size="sm" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center space-x-2">
              <PriorityBadge priority={option.value} size="sm" />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
