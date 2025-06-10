
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { GoogleSheetsImporter } from '@/components/uco/GoogleSheetsImporter';
import { UcoCollectionPlan } from '@/types/ucoCollection';
import { toast } from 'sonner';

interface GoogleSheetsTabProps {
  plans: UcoCollectionPlan[] | undefined;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  onExportPlan: (planId: string) => void;
}

export const GoogleSheetsTab = ({ 
  plans, 
  selectedPlanId, 
  setSelectedPlanId, 
  onExportPlan 
}: GoogleSheetsTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GoogleSheetsImporter 
        onImportComplete={(planId) => {
          setSelectedPlanId(planId);
          toast.success('Plan imported! Check the Route Optimizer tab.');
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-green-600" />
            <span>Export to Google Sheets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Plan to Export</label>
            <Select onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.plan_name} - {plan.townships.join(', ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => selectedPlanId && onExportPlan(selectedPlanId)}
            disabled={!selectedPlanId}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>Exports current plan data including status updates and collection details</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
