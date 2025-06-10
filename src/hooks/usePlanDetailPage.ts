
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
  const { items, isLoading: itemsLoading, bulkCreateItems, error: itemsError } = useUcoItems(id);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);

  const plan = plans?.find(p => p.id === id);

  useEffect(() => {
    // Auto-open restaurant selector for empty plans (only if no errors)
    if (plan && items && items.length === 0 && !itemsError) {
      console.log('Auto-opening restaurant selector for empty plan');
      setShowRestaurantSelector(true);
    }
  }, [plan, items, itemsError]);

  useEffect(() => {
    // Log plan and items for debugging
    if (plan) {
      console.log('Current plan:', plan);
    }
    if (items) {
      console.log('Current items:', items);
    }
    if (itemsError) {
      console.error('Items error:', itemsError);
    }
  }, [plan, items, itemsError]);

  const handleAddRestaurants = async (restaurantIds: string[]) => {
    if (!id) {
      toast.error('Plan ID is missing');
      return;
    }

    if (restaurantIds.length === 0) {
      toast.error('Please select at least one restaurant');
      return;
    }

    console.log('Adding restaurants to plan:', { planId: id, restaurantIds });

    // Get the current highest route sequence
    const currentMaxSequence = items?.reduce((max, item) => 
      Math.max(max, item.route_sequence || 0), 0
    ) || 0;

    const newItems = restaurantIds.map((restaurantId, index) => ({
      plan_id: id,
      restaurant_id: restaurantId,
      route_sequence: currentMaxSequence + index + 1,
      uco_status: 'not_assessed' as const,
      collection_priority: 'medium' as const,
    }));

    try {
      await bulkCreateItems.mutateAsync(newItems);
      setShowRestaurantSelector(false);
      toast.success(`Successfully added ${restaurantIds.length} restaurants to the collection plan`);
    } catch (error) {
      toast.error('Failed to add restaurants to plan');
      console.error('Error adding restaurants:', error);
    }
  };

  const isOwner = profile?.id === plan?.created_by;

  const handleBack = () => navigate('/uco/dashboard');
  const handleOptimizeRoute = () => {
    if (!items || items.length === 0) {
      toast.error('Add restaurants to the plan before optimizing the route');
      return;
    }
    navigate(`/uco/routes?plan=${id}`);
  };

  return {
    plan,
    items,
    itemsLoading,
    itemsError,
    isOwner,
    showRestaurantSelector,
    setShowRestaurantSelector,
    handleAddRestaurants,
    handleBack,
    handleOptimizeRoute,
  };
};
