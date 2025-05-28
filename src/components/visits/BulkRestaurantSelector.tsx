
import { useState, useEffect } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RestaurantWithLead } from '@/types/visits';
import RestaurantFilters from './bulk-selector/RestaurantFilters';
import SelectAllControl from './bulk-selector/SelectAllControl';
import RestaurantList from './bulk-selector/RestaurantList';
import BulkPagination from './bulk-selector/BulkPagination';
import BulkActions from './bulk-selector/BulkActions';

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
        <RestaurantFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTownship={selectedTownship}
          onTownshipChange={setSelectedTownship}
          selectedLeadStatus={selectedLeadStatus}
          onLeadStatusChange={setSelectedLeadStatus}
          townships={townships}
          resultCount={filteredRestaurants.length}
        />

        <SelectAllControl
          isAllSelected={allCurrentPageSelected}
          onSelectAll={handleSelectAll}
          currentPageCount={paginatedRestaurants.length}
        />

        <RestaurantList
          restaurants={paginatedRestaurants}
          selectedRestaurants={selectedRestaurants}
          onRestaurantToggle={handleRestaurantToggle}
        />

        <BulkPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={startIndex + ITEMS_PER_PAGE}
          totalItems={filteredRestaurants.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />

        <BulkActions
          selectedCount={selectedRestaurants.length}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default BulkRestaurantSelector;
