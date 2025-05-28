
import { Checkbox } from '@/components/ui/checkbox';

interface SelectAllControlProps {
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  currentPageCount: number;
}

const SelectAllControl = ({
  isAllSelected,
  onSelectAll,
  currentPageCount
}: SelectAllControlProps) => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
      <Checkbox
        checked={isAllSelected}
        onCheckedChange={onSelectAll}
      />
      <span className="font-medium">
        Select all on this page ({currentPageCount} restaurants)
      </span>
    </div>
  );
};

export default SelectAllControl;
