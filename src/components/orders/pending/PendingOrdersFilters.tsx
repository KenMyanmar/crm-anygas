
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';

interface PendingOrdersFiltersProps {
  searchTerm: string;
  townshipFilter: string;
  townships: string[];
  onSearchChange: (value: string) => void;
  onTownshipChange: (value: string) => void;
}

const PendingOrdersFilters = ({
  searchTerm,
  townshipFilter,
  townships,
  onSearchChange,
  onTownshipChange
}: PendingOrdersFiltersProps) => {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-64"
        />
      </div>
      <Select value={townshipFilter} onValueChange={onTownshipChange}>
        <SelectTrigger className="w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by township" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Townships</SelectItem>
          {townships.map((township) => (
            <SelectItem key={township} value={township}>
              {township}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PendingOrdersFilters;
