
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';

interface RestaurantFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTownship: string;
  onTownshipChange: (value: string) => void;
  selectedLeadStatus: string;
  onLeadStatusChange: (value: string) => void;
  townships: string[];
  resultCount: number;
}

const RestaurantFilters = ({
  searchTerm,
  onSearchChange,
  selectedTownship,
  onTownshipChange,
  selectedLeadStatus,
  onLeadStatusChange,
  townships,
  resultCount
}: RestaurantFiltersProps) => {
  const leadStatuses = ['CONTACT_STAGE', 'MEETING_STAGE', 'PRESENTATION_NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Input
          placeholder="Search restaurants..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Select value={selectedTownship} onValueChange={onTownshipChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Townships" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Townships</SelectItem>
          {townships.map(township => (
            <SelectItem key={township} value={township}>
              {township}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedLeadStatus} onValueChange={onLeadStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Lead Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Lead Status</SelectItem>
          {leadStatuses.map(status => (
            <SelectItem key={status} value={status}>
              {status.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {resultCount} results
        </span>
      </div>
    </div>
  );
};

export default RestaurantFilters;
