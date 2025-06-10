
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUcoPlans } from '@/hooks/useUcoPlans';
import { toast } from 'sonner';

interface UcoPlanFormData {
  plan_name: string;
  townships: string[];
  plan_date: string;
  driver_name: string;
  truck_capacity_kg: number;
}

export const useUcoPlanForm = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createPlan } = useUcoPlans();
  
  const [formData, setFormData] = useState<UcoPlanFormData>({
    plan_name: '',
    townships: [],
    plan_date: new Date().toISOString().split('T')[0],
    driver_name: '',
    truck_capacity_kg: 500,
  });

  const handleInputChange = (field: keyof UcoPlanFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePlanName = (townships: string[]) => {
    if (townships.length === 0) return '';
    if (townships.length === 1) return `${townships[0]} UCO Collection`;
    if (townships.length <= 3) return `${townships.join(', ')} UCO Collection`;
    return `Multi-Township UCO Collection (${townships.length} areas)`;
  };

  const handleTownshipChange = (townships: string[]) => {
    handleInputChange('townships', townships);
    
    // Auto-generate plan name if it's empty or was auto-generated
    if (!formData.plan_name || formData.plan_name.includes('UCO Collection')) {
      const suggestedName = generatePlanName(townships);
      if (suggestedName) {
        handleInputChange('plan_name', suggestedName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast.error('You must be logged in to create plans');
      return;
    }

    if (!formData.plan_name || formData.townships.length === 0) {
      toast.error('Please fill in plan name and select at least one township');
      return;
    }

    try {
      const newPlan = await createPlan.mutateAsync({
        plan_name: formData.plan_name,
        townships: formData.townships,
        plan_date: formData.plan_date,
        driver_name: formData.driver_name,
        truck_capacity_kg: formData.truck_capacity_kg,
        created_by: profile.id,
      });
      
      toast.success('UCO collection plan created successfully');
      navigate(`/uco/plans/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create UCO collection plan');
    }
  };

  return {
    formData,
    handleInputChange,
    handleTownshipChange,
    handleSubmit,
    isSubmitting: createPlan.isPending,
  };
};
