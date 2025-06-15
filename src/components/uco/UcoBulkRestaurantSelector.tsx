
import { useState } from 'react';
import { useBulkRestaurantSelector } from '@/hooks/useBulkRestaurantSelector';
import { BulkSelectorHeader } from './bulk-selector/BulkSelectorHeader';
import { BulkSelectorFilters } from './bulk-selector/BulkSelectorFilters';
import { SelectAllControl } from './bulk-selector/SelectAllControl';
import { RestaurantListItem } from './bulk-selector/RestaurantListItem';
import { BulkSelectorActionBar } from './bulk-selector/BulkSelectorActionBar';
import { BulkExpectedVolumeEditor } from './bulk-selector/BulkExpectedVolumeEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface UcoBulkRestaurantSelectorProps {
  onConfirm: (data: { restaurantIds: string[]; expectedVolumes: Record<string, number> }) => void;
  onCancel: () => void;
  selectedTownship?: string;
}

export const UcoBulkRestaurantSelector = ({
  onConfirm,
  onCancel,
  selectedTownship
}: UcoBulkRestaurantSelectorProps) => {
  const {
    restaurants,
    isLoading,
    selectedRestaurants,
    searchTerm,
    setSearchTerm,
    townshipFilter,
    setTownshipFilter,
    ucoStatusFilter,
    setUcoStatusFilter,
    filteredRestaurants,
    uniqueTownships,
    handleRestaurantToggle,
    handleSelectAll,
    isAllSelected,
  } = useBulkRestaurantSelector(selectedTownship);

  const [expectedVolumes, setExpectedVolumes] = useState<Record<string, number>>({});

  const handleExpectedVolumeChange = (restaurantId: string, volume: number) => {
    setExpectedVolumes(prev => ({
      ...prev,
      [restaurantId]: volume
    }));
  };

  const handleConfirmWithVolumes = () => {
    onConfirm({
      restaurantIds: selectedRestaurants,
      expectedVolumes
    });
  };

  const selectedRestaurantObjects = filteredRestaurants.filter(r => 
    selectedRestaurants.includes(r.id)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BulkSelectorHeader selectedCount={selectedRestaurants.length} />

      <BulkSelectorFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        townshipFilter={townshipFilter}
        onTownshipFilterChange={setTownshipFilter}
        ucoStatusFilter={ucoStatusFilter}
        onUcoStatusFilterChange={setUcoStatusFilter}
        uniqueTownships={uniqueTownships}
      />

      <SelectAllControl
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        filteredCount={filteredRestaurants.length}
        totalCount={restaurants?.length || 0}
      />

      {/* Expected Volume Planning - Show when restaurants are selected */}
      {selectedRestaurants.length > 0 && (
        <>
          <BulkExpectedVolumeEditor
            selectedRestaurants={selectedRestaurantObjects}
            expectedVolumes={expectedVolumes}
            onExpectedVolumesChange={setExpectedVolumes}
          />
          <Separator />
        </>
      )}

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantListItem
              key={restaurant.id}
              restaurant={restaurant}
              isSelected={selectedRestaurants.includes(restaurant.id)}
              onToggle={handleRestaurantToggle}
              expectedVolume={expectedVolumes[restaurant.id]}
              onExpectedVolumeChange={handleExpectedVolumeChange}
            />
          ))}
        </div>
      </ScrollArea>

      <BulkSelectorActionBar
        selectedCount={selectedRestaurants.length}
        onConfirm={handleConfirmWithVolumes}
        onCancel={onCancel}
      />
    </div>
  );
};
