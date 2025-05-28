
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X } from 'lucide-react';

interface ProfessionalActionBarProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProfessionalActionBar = ({
  selectedCount,
  onConfirm,
  onCancel,
  isLoading = false
}: ProfessionalActionBarProps) => {
  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            {selectedCount} restaurant{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
          {selectedCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onCancel()}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear selection
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={selectedCount === 0 || isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              `Add ${selectedCount} to Plan`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalActionBar;
