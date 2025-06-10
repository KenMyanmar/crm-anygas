
import { Button } from '@/components/ui/button';

interface PlanFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

export const PlanFormActions = ({ onCancel, isSubmitting, isFormValid }: PlanFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || !isFormValid}
        className="min-w-[120px]"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating...
          </div>
        ) : (
          'Create Plan'
        )}
      </Button>
    </div>
  );
};
