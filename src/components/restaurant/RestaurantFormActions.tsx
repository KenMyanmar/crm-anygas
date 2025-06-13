
import { Button } from '@/components/ui/button';

interface RestaurantFormActionsProps {
  isSubmitting: boolean;
  isFormValid: boolean;
  onCancel: () => void;
}

export const RestaurantFormActions = ({ 
  isSubmitting, 
  isFormValid, 
  onCancel 
}: RestaurantFormActionsProps) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button 
        type="submit" 
        disabled={isSubmitting || !isFormValid} 
        className="flex-1"
      >
        {isSubmitting ? 'Creating Restaurant...' : 'Create Restaurant'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </div>
  );
};
