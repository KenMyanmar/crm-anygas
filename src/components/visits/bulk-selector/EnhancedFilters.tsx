
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X } from 'lucide-react';

interface EnhancedFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTownship: string;
  onTownshipChange: (value: string) => void;
  selectedLeadStatus: string;
  onLeadStatusChange: (value: string) => void;
  townships: string[];
  resultCount: number;
  onClearFilters: () => void;
}

const EnhancedFilters = ({
  searchTerm,
  onSearchChange,
  selectedTownship,
  onTownshipChange,
  selectedLeadStatus,
  onLeadStatusChange,
  townships,
  resultCount,
  onClearFilters
}: EnhancedFiltersProps) => {
  const hasActiveFilters = searchTerm || selectedTownship !== 'all' || selectedLeadStatus !== 'all';

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filter Restaurants</h3>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact person..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Township</label>
          <Select value={selectedTownship} onValueChange={onTownshipChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All townships" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All townships</SelectItem>
              {townships.map((township) => (
                <SelectItem key={township} value={township}>
                  {township}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Lead Status</label>
          <Select value={selectedLeadStatus} onValueChange={onLeadStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="CONTACT_STAGE">Contact Stage</SelectItem>
              <SelectItem value="MEETING_STAGE">Meeting Stage</SelectItem>
              <SelectItem value="PRESENTATION_NEGOTIATION">Presentation/Negotiation</SelectItem>
              <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
              <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {resultCount} restaurants found
          </Badge>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-muted-foreground">
              Filters active
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFilters;
