
import { Card, CardContent } from '@/components/ui/card';
import { UcoTownshipMultiSelector } from '@/components/uco/UcoTownshipMultiSelector';
import { useUcoPlanForm } from '@/hooks/useUcoPlanForm';
import { PlanFormHeader } from './plan-form/PlanFormHeader';
import { PlanNameField } from './plan-form/PlanNameField';
import { DateAndDriverFields } from './plan-form/DateAndDriverFields';
import { TruckCapacityField } from './plan-form/TruckCapacityField';
import { PlanFormActions } from './plan-form/PlanFormActions';

interface UcoPlanFormProps {
  onCancel: () => void;
}

export const UcoPlanForm = ({ onCancel }: UcoPlanFormProps) => {
  const {
    formData,
    handleInputChange,
    handleTownshipChange,
    handleSubmit,
    isSubmitting,
  } = useUcoPlanForm();

  const isFormValid = formData.townships.length > 0;

  return (
    <Card>
      <PlanFormHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <PlanNameField
              value={formData.plan_name}
              onChange={(value) => handleInputChange('plan_name', value)}
            />

            <UcoTownshipMultiSelector
              selectedTownships={formData.townships}
              onChange={handleTownshipChange}
              placeholder="Select townships for collection"
            />

            <DateAndDriverFields
              planDate={formData.plan_date}
              driverName={formData.driver_name}
              onPlanDateChange={(value) => handleInputChange('plan_date', value)}
              onDriverNameChange={(value) => handleInputChange('driver_name', value)}
            />

            <TruckCapacityField
              value={formData.truck_capacity_kg}
              onChange={(value) => handleInputChange('truck_capacity_kg', value)}
            />
          </div>

          <PlanFormActions
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
          />
        </form>
      </CardContent>
    </Card>
  );
};
