
import { useState, useMemo } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';

export const useBulkRestaurantSelector = (selectedTownship?: string) => {
  const { restaurants, isLoading } = useRestaurants();
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState(selectedTownship || 'all');
  const [ucoStatusFilter, setUcoStatusFilter] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTownship = townshipFilter === 'all' || restaurant.township === townshipFilter;
      const matchesUcoStatus = ucoStatusFilter === 'all' || restaurant.uco_supplier_status === ucoStatusFilter;
      
      return matchesSearch && matchesTownship && matchesUcoStatus;
    }) || [];
  }, [restaurants, searchTerm, townshipFilter, ucoStatusFilter]);

  const uniqueTownships = [...new Set(restaurants?.map(r => r.township).filter(Boolean) || [])];

  const handleRestaurantToggle = (restaurantId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectedRestaurants(prev => 
      isChecked 
        ? [...prev, restaurantId]
        : prev.filter(id => id !== restaurantId)
    );
  };

  const handleSelectAll = () => {
    if (selectedRestaurants.length === filteredRestaurants.length) {
      setSelectedRestaurants([]);
    } else {
      setSelectedRestaurants(filteredRestaurants.map(r => r.id));
    }
  };

  const isAllSelected = selectedRestaurants.length === filteredRestaurants.length && filteredRestaurants.length > 0;

  return {
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
  };
};
