
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export const PlanFormHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Truck className="h-5 w-5 text-blue-600" />
        <span>Collection Plan Details</span>
      </CardTitle>
    </CardHeader>
  );
};
