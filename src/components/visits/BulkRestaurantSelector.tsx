
import { useState, useEffect } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useLeads } from '@/hooks/useLeads';
import { RestaurantWithLead } from '@/types/visits';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ProfessionalHeader from './bulk-selector/ProfessionalHeader';
import EnhancedFilters from './bulk-selector/EnhancedFilters';
import RestaurantDataTable from './bulk-selector/RestaurantDataTable';
import ProfessionalActionBar from './bulk-selector/ProfessionalActionBar';

interface BulkRestaurantSelectorProps {
  selectedRestaurants: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const BulkRestaurantSelector = ({
  selectedRestaurants,
  onSelectionChange,
  onConfirm,
  onCancel
}: BulkRestaurantSelectorProps) => {
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const { leads, isLoading: leadsLoading } = useLeads();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTownship, setSelectedTownship] = useState<string>('all');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<string>('all');
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithLead[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = restaurantsLoading || leadsLoading;

  // Merge restaurants with lead data and apply filters
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

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.township?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTownship !== 'all') {
      filtered = filtered.filter(r => r.township === selectedTownship);
    }

    if (selectedLeadStatus !== 'all') {
      filtered = filtered.filter(r => r.lead_status === selectedLeadStatus);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, leads, searchTerm, selectedTownship, selectedLeadStatus]);

  const townships = [...new Set(restaurants.map(r => r.township).filter(Boolean))].sort();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredRestaurants.map(r => r.id);
      const newSelection = [...new Set([...selectedRestaurants, ...allFilteredIds])];
      onSelectionChange(newSelection);
    } else {
      const filteredIds = new Set(filteredRestaurants.map(r => r.id));
      const newSelection = selectedRestaurants.filter(id => !filteredIds.has(id));
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTownship('all');
    setSelectedLeadStatus('all');
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCurrentPageSelected = filteredRestaurants.length > 0 && 
    filteredRestaurants.every(r => selectedRestaurants.includes(r.id));

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No restaurants found. Please add restaurants to your database first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[85vh]">
      <div className="p-6 pb-4 space-y-6 flex-shrink-0">
        <ProfessionalHeader
          selectedCount={selectedRestaurants.length}
          totalCount={restaurants.length}
          filteredCount={filteredRestaurants.length}
        />

        <EnhancedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTownship={selectedTownship}
          onTownshipChange={setSelectedTownship}
          selectedLeadStatus={selectedLeadStatus}
          onLeadStatusChange={setSelectedLeadStatus}
          townships={townships}
          resultCount={filteredRestaurants.length}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="flex-1 px-6 min-h-0">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No restaurants match your filters</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or clearing the filters.
            </p>
          </div>
        ) : (
          <RestaurantDataTable
            restaurants={filteredRestaurants}
            selectedRestaurants={selectedRestaurants}
            onRestaurantToggle={handleRestaurantToggle}
            onSelectAll={handleSelectAll}
            isAllSelected={allCurrentPageSelected}
          />
        )}
      </div>

      <ProfessionalActionBar
        selectedCount={selectedRestaurants.length}
        onConfirm={handleConfirm}
        onCancel={onCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default BulkRestaurantSelector;
