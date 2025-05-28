
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { VisitPlan, VisitTask } from '@/types/visits';

export const useVisitPlans = () => {
  const [plans, setPlans] = useState<VisitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVisitPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('visit_plans')
        .select('*')
        .order('plan_date', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching visit plans:', error);
      toast({
        title: "Error",
        description: "Failed to load visit plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createVisitPlan = async (planData: Omit<VisitPlan, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('visit_plans')
        .insert({
          ...planData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Visit plan created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating visit plan:', error);
      toast({
        title: "Error",
        description: "Failed to create visit plan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVisitPlan = async (id: string, updates: Partial<VisitPlan>) => {
    try {
      const { data, error } = await supabase
        .from('visit_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => prev.map(plan => 
        plan.id === id ? { ...plan, ...data } : plan
      ));

      toast({
        title: "Success",
        description: "Visit plan updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating visit plan:', error);
      toast({
        title: "Error",
        description: "Failed to update visit plan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteVisitPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visit_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.filter(plan => plan.id !== id));
      toast({
        title: "Success",
        description: "Visit plan deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting visit plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete visit plan",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVisitPlans();
  }, []);

  return {
    plans,
    isLoading,
    createVisitPlan,
    updateVisitPlan,
    deleteVisitPlan,
    refetch: fetchVisitPlans
  };
};
