
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SelectAllControlProps {
  isAllSelected: boolean;
  onSelectAll: () => void;
  filteredCount: number;
  totalCount: number;
}

export const SelectAllControl = ({
  isAllSelected,
  onSelectAll,
  filteredCount,
  totalCount
}: SelectAllControlProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="select-all"
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
        />
        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Select All ({filteredCount} restaurants)
        </label>
      </div>
      <Badge variant="secondary">
        {filteredCount} of {totalCount} restaurants
      </Badge>
    </div>
  );
};
