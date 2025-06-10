
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTownshipAnalytics } from '@/hooks/useTownshipAnalytics';
import { MapPin, Search, CheckSquare, Square } from 'lucide-react';

interface UcoTownshipMultiSelectorProps {
  selectedTownships: string[];
  onChange: (townships: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const UcoTownshipMultiSelector = ({
  selectedTownships,
  onChange,
  label = "Townships",
  placeholder = "Select townships for collection"
}: UcoTownshipMultiSelectorProps) => {
  const { analytics, isLoading } = useTownshipAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTownships = analytics?.filter(township => 
    township.township.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleTownshipToggle = (township: string, checked: boolean | string) => {
    const isChecked = checked === true;
    if (isChecked) {
      onChange([...selectedTownships, township]);
    } else {
      onChange(selectedTownships.filter(t => t !== township));
    }
  };

  const handleSelectAll = () => {
    if (selectedTownships.length === filteredTownships.length) {
      onChange([]);
    } else {
      onChange(filteredTownships.map(t => t.township));
    }
  };

  const allSelected = selectedTownships.length === filteredTownships.length && filteredTownships.length > 0;
  const someSelected = selectedTownships.length > 0 && selectedTownships.length < filteredTownships.length;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="animate-pulse h-10 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label} *</label>
      
      {/* Summary Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between h-auto p-3"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-left">
            {selectedTownships.length === 0 
              ? placeholder
              : selectedTownships.length === filteredTownships.length
                ? "All Townships Selected"
                : `${selectedTownships.length} Township${selectedTownships.length !== 1 ? 's' : ''} Selected`
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectedTownships.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTownships.length}
            </Badge>
          )}
          {isExpanded ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </div>
      </Button>

      {/* Selected Townships Preview */}
      {selectedTownships.length > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-1">
          {selectedTownships.slice(0, 3).map(township => (
            <Badge key={township} variant="outline" className="text-xs">
              {township}
            </Badge>
          ))}
          {selectedTownships.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedTownships.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Expanded Selection Panel */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Townships</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search townships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Select All Control */}
            <div className="flex items-center justify-between p-2 mb-3 bg-muted/30 rounded">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Select All ({filteredTownships.length} townships)
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {selectedTownships.length} selected
              </Badge>
            </div>

            {/* Township List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredTownships.map((townshipData) => (
                <div 
                  key={townshipData.township}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTownships.includes(townshipData.township)}
                      onCheckedChange={(checked) => handleTownshipToggle(townshipData.township, checked)}
                    />
                    <div>
                      <span className="text-sm font-medium">{townshipData.township}</span>
                      <p className="text-xs text-muted-foreground">
                        {townshipData.total_restaurants} restaurants
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{townshipData.active_suppliers} active suppliers</div>
                    <div>{townshipData.potential_suppliers} potential</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button 
                size="sm" 
                onClick={() => setIsExpanded(false)}
                disabled={selectedTownships.length === 0}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
