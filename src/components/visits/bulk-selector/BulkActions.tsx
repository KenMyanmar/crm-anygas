
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const BulkActions = ({
  selectedCount,
  onConfirm,
  onCancel
}: BulkActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        onClick={onConfirm}
        disabled={selectedCount === 0}
      >
        Add {selectedCount} Restaurant{selectedCount !== 1 ? 's' : ''} to Visit Plan
      </Button>
    </div>
  );
};

export default BulkActions;
