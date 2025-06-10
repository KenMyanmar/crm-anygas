
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface BulkSelectorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  townshipFilter: string;
  onTownshipFilterChange: (value: string) => void;
  ucoStatusFilter: string;
  onUcoStatusFilterChange: (value: string) => void;
  uniqueTownships: string[];
}

export const BulkSelectorFilters = ({
  searchTerm,
  onSearchChange,
  townshipFilter,
  onTownshipFilterChange,
  ucoStatusFilter,
  onUcoStatusFilterChange,
  uniqueTownships
}: BulkSelectorFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={townshipFilter} onValueChange={onTownshipFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by township" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Townships</SelectItem>
          {uniqueTownships.map(township => (
            <SelectItem key={township} value={township}>{township}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={ucoStatusFilter} onValueChange={onUcoStatusFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="UCO Supplier Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active Supplier</SelectItem>
          <SelectItem value="potential">Potential Supplier</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
