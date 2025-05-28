
import { useState, useEffect } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { RestaurantWithLead } from '@/types/visits';
import { format } from 'date-fns';

interface BulkRestaurantSelectorProps {
  selectedRestaurants: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ITEMS_PER_PAGE = 50;

const BulkRestaurantSelector = ({
  selectedRestaurants,
  onSelectionChange,
  onConfirm,
  onCancel
}: BulkRestaurantSelectorProps) => {
  const { restaurants } = useRestaurants();
  const { leads } = useLeads();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTownship, setSelectedTownship] = useState<string>('all');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<string>('all');
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithLead[]>([]);

  // Merge restaurants with lead data
  useEffect(() => {
    const restaurantsWithLeads: RestaurantWithLead[] = restaurants.map(restaurant => {
      const lead = leads.find(l => l.restaurant_id === restaurant.id);
      return {
        id: restaurant.id,
        name: restaurant.name,
        township: restaurant.township,
        address: restaurant.address,
        contact_person: restaurant.contact_person,
        phone: restaurant.phone,
        lead_status: lead?.status as 'CONTACT_STAGE' | 'MEETING_STAGE' | 'PRESENTATION_NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST' | undefined,
        assigned_user: lead?.assigned_user?.full_name,
        next_action_date: lead?.next_action_date,
      };
    });

    let filtered = restaurantsWithLeads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.township?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by township
    if (selectedTownship !== 'all') {
      filtered = filtered.filter(r => r.township === selectedTownship);
    }

    // Filter by lead status
    if (selectedLeadStatus !== 'all') {
      filtered = filtered.filter(r => r.lead_status === selectedLeadStatus);
    }

    setFilteredRestaurants(filtered);
    setCurrentPage(1);
  }, [restaurants, leads, searchTerm, selectedTownship, selectedLeadStatus]);

  const townships = [...new Set(restaurants.map(r => r.township).filter(Boolean))].sort();
  const leadStatuses = ['CONTACT_STAGE', 'MEETING_STAGE', 'PRESENTATION_NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedRestaurants.map(r => r.id);
      const newSelection = [...new Set([...selectedRestaurants, ...currentPageIds])];
      onSelectionChange(newSelection);
    } else {
      const currentPageIds = new Set(paginatedRestaurants.map(r => r.id));
      const newSelection = selectedRestaurants.filter(id => !currentPageIds.has(id));
      onSelectionChange(newSelection);
    }
  };

  const handleRestaurantToggle = (restaurantId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRestaurants, restaurantId]);
    } else {
      onSelectionChange(selectedRestaurants.filter(id => id !== restaurantId));
    }
  };

  const getLeadStatusColor = (status?: string) => {
    switch (status) {
      case 'CONTACT_STAGE': return 'bg-purple-100 text-purple-800';
      case 'MEETING_STAGE': return 'bg-amber-100 text-amber-800';
      case 'PRESENTATION_NEGOTIATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED_WON': return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allCurrentPageSelected = paginatedRestaurants.length > 0 && 
    paginatedRestaurants.every(r => selectedRestaurants.includes(r.id));

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Restaurants for Visit Plan</span>
          <Badge variant="outline">
            {selectedRestaurants.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedTownship} onValueChange={setSelectedTownship}>
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
          <Select value={selectedLeadStatus} onValueChange={setSelectedLeadStatus}>
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
              {filteredRestaurants.length} results
            </span>
          </div>
        </div>

        {/* Select All */}
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
          <Checkbox
            checked={allCurrentPageSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="font-medium">
            Select all on this page ({paginatedRestaurants.length} restaurants)
          </span>
        </div>

        {/* Restaurant List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {paginatedRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedRestaurants.includes(restaurant.id)}
                  onCheckedChange={(checked) => 
                    handleRestaurantToggle(restaurant.id, checked as boolean)
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{restaurant.name}</h3>
                    {restaurant.lead_status && (
                      <Badge className={getLeadStatusColor(restaurant.lead_status)}>
                        {restaurant.lead_status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {restaurant.township && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {restaurant.township}
                      </div>
                    )}
                    {restaurant.contact_person && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {restaurant.contact_person}
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {restaurant.phone}
                      </div>
                    )}
                  </div>
                  {restaurant.next_action_date && (
                    <div className="flex items-center text-sm text-amber-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Next action: {format(new Date(restaurant.next_action_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={selectedRestaurants.length === 0}
          >
            Add {selectedRestaurants.length} Restaurant{selectedRestaurants.length !== 1 ? 's' : ''} to Visit Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkRestaurantSelector;
