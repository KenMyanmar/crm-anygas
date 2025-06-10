
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUcoPlans } from '@/hooks/useUcoPlans';
import { useUcoItems } from '@/hooks/useUcoItems';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const usePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans } = useUcoPlans();
  const { items, isLoading: itemsLoading, bulkCreateItems } = useUcoItems(id);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);

  const plan = plans?.find(p => p.id === id);

  useEffect(() => {
    // Auto-open restaurant selector for empty plans (like visits)
    if (plan && items && items.length === 0) {
      setShowRestaurantSelector(true);
    }
  }, [plan, items]);

  const handleAddRestaurants = async (restaurantIds: string[]) => {
    const newItems = restaurantIds.map((restaurantId, index) => ({
      plan_id: id!,
      restaurant_id: restaurantId,
      route_sequence: (items?.length || 0) + index + 1,
      uco_status: 'not_assessed' as const,
      collection_priority: 'medium' as const,
    }));

    try {
      await bulkCreateItems.mutateAsync(newItems);
      setShowRestaurantSelector(false);
    } catch (error) {
      toast.error('Failed to add restaurants to plan');
      console.error('Error adding restaurants:', error);
    }
  };

  const isOwner = profile?.id === plan?.created_by;

  const handleBack = () => navigate('/uco/dashboard');
  const handleOptimizeRoute = () => navigate(`/uco/routes?plan=${id}`);

  return {
    plan,
    items,
    itemsLoading,
    isOwner,
    showRestaurantSelector,
    setShowRestaurantSelector,
    handleAddRestaurants,
    handleBack,
    handleOptimizeRoute,
  };
};
