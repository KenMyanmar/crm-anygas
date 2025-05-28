
import { useState } from 'react';
import { RestaurantWithLead } from '@/types/visits';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, User, Calendar, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface RestaurantDataTableProps {
  restaurants: RestaurantWithLead[];
  selectedRestaurants: string[];
  onRestaurantToggle: (restaurantId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

type SortField = 'name' | 'township' | 'lead_status' | 'next_action_date';
type SortDirection = 'asc' | 'desc';

const RestaurantDataTable = ({
  restaurants,
  selectedRestaurants,
  onRestaurantToggle,
  onSelectAll,
  isAllSelected
}: RestaurantDataTableProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'next_action_date') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getLeadStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusConfig = {
      'CONTACT_STAGE': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Contact' },
      'MEETING_STAGE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Meeting' },
      'PRESENTATION_NEGOTIATION': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Negotiation' },
      'CLOSED_WON': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Won' },
      'CLOSED_LOST': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Lost' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b bg-muted/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all restaurants"
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="name">Restaurant Name</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="township">Location</SortableHeader>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>
                <SortableHeader field="lead_status">Lead Status</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="next_action_date">Next Action</SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
      
      <ScrollArea className="h-96">
        <Table>
          <TableBody>
            {sortedRestaurants.map((restaurant) => (
              <TableRow 
                key={restaurant.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onRestaurantToggle(restaurant.id, !selectedRestaurants.includes(restaurant.id))}
              >
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedRestaurants.includes(restaurant.id)}
                    onCheckedChange={(checked) => onRestaurantToggle(restaurant.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{restaurant.name}</div>
                  {restaurant.address && (
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {restaurant.address}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {restaurant.township || 'Not specified'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {restaurant.contact_person && (
                      <div className="flex items-center text-sm">
                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                        {restaurant.contact_person}
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {restaurant.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getLeadStatusBadge(restaurant.lead_status)}
                </TableCell>
                <TableCell>
                  {restaurant.next_action_date ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      {format(new Date(restaurant.next_action_date), 'MMM dd, yyyy')}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No date set</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default RestaurantDataTable;
