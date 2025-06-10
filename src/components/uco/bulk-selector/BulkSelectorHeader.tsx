
import { Badge } from '@/components/ui/badge';
import { Droplets } from 'lucide-react';

interface BulkSelectorHeaderProps {
  selectedCount: number;
}

export const BulkSelectorHeader = ({ selectedCount }: BulkSelectorHeaderProps) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
          <Droplets className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Select Restaurants for UCO Collection</h3>
          <p className="text-sm text-muted-foreground">
            Choose restaurants to include in your collection plan
          </p>
        </div>
      </div>
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        {selectedCount} selected
      </Badge>
    </div>
  );
};
