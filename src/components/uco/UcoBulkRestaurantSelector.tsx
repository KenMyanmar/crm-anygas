
import { useBulkRestaurantSelector } from '@/hooks/useBulkRestaurantSelector';
import { BulkSelectorHeader } from './bulk-selector/BulkSelectorHeader';
import { BulkSelectorFilters } from './bulk-selector/BulkSelectorFilters';
import { SelectAllControl } from './bulk-selector/SelectAllControl';
import { RestaurantList } from './bulk-selector/RestaurantList';
import { BulkSelectorActionBar } from './bulk-selector/BulkSelectorActionBar';

interface UcoBulkRestaurantSelectorProps {
  onConfirm: (restaurantIds: string[]) => void;
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

      <RestaurantList
        restaurants={filteredRestaurants}
        selectedRestaurants={selectedRestaurants}
        onRestaurantToggle={handleRestaurantToggle}
      />

      <BulkSelectorActionBar
        selectedCount={selectedRestaurants.length}
        onConfirm={() => onConfirm(selectedRestaurants)}
        onCancel={onCancel}
      />
    </div>
  );
};
