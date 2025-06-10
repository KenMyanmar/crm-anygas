
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UcoTownshipMultiSelector } from '@/components/uco/UcoTownshipMultiSelector';
import { useUcoPlanForm } from '@/hooks/useUcoPlanForm';
import { Truck, Calendar, Users } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <span>Collection Plan Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan_name">Plan Name *</Label>
              <Input
                id="plan_name"
                value={formData.plan_name}
                onChange={(e) => handleInputChange('plan_name', e.target.value)}
                placeholder="e.g., Yankin Township UCO Collection"
                required
              />
            </div>

            <UcoTownshipMultiSelector
              selectedTownships={formData.townships}
              onChange={handleTownshipChange}
              placeholder="Select townships for collection"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan_date">Collection Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="plan_date"
                    type="date"
                    value={formData.plan_date}
                    onChange={(e) => handleInputChange('plan_date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="driver_name"
                    value={formData.driver_name}
                    onChange={(e) => handleInputChange('driver_name', e.target.value)}
                    placeholder="Enter driver name"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_capacity">Truck Capacity (kg)</Label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="truck_capacity"
                  type="number"
                  value={formData.truck_capacity_kg}
                  onChange={(e) => handleInputChange('truck_capacity_kg', parseInt(e.target.value) || 0)}
                  placeholder="500"
                  className="pl-10"
                  min="1"
                />
              </div>
            </div>
          </div>

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
              disabled={isSubmitting || formData.townships.length === 0}
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
        </form>
      </CardContent>
    </Card>
  );
};
