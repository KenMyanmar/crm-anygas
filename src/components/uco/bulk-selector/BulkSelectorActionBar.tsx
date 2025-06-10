
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets } from 'lucide-react';

interface BulkSelectorActionBarProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkSelectorActionBar = ({
  selectedCount,
  onConfirm,
  onCancel
}: BulkSelectorActionBarProps) => {
  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4 -mx-6 -mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Droplets className="h-4 w-4 mr-1" />
            {selectedCount} restaurant{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={selectedCount === 0}
            className="min-w-[140px]"
          >
            Add {selectedCount} to Plan
          </Button>
        </div>
      </div>
    </div>
  );
};
