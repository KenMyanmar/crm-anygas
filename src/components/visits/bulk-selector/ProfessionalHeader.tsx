
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, Filter } from 'lucide-react';

interface ProfessionalHeaderProps {
  selectedCount: number;
  totalCount: number;
  filteredCount: number;
}

const ProfessionalHeader = ({
  selectedCount,
  totalCount,
  filteredCount
}: ProfessionalHeaderProps) => {
  const selectionProgress = filteredCount > 0 ? (selectedCount / filteredCount) * 100 : 0;

  return (
    <div className="space-y-4 pb-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Add Restaurants to Visit Plan</h2>
            <p className="text-sm text-muted-foreground">
              Select restaurants to include in your visit schedule
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Filter className="h-3 w-3 mr-1" />
            {filteredCount} of {totalCount} restaurants
          </Badge>
          {selectedCount > 0 && (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      </div>
      
      {selectedCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Selection Progress</span>
            <span className="font-medium">{selectedCount} / {filteredCount}</span>
          </div>
          <Progress value={selectionProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default ProfessionalHeader;
