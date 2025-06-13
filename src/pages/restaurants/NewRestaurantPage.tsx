import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks/useLeads';
import { hasAdminAccess } from '@/utils/roleUtils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { RestaurantFollowUpForm } from '@/components/restaurant/RestaurantFollowUpForm';
import { RestaurantFormFields } from '@/components/restaurant/RestaurantFormFields';
import { RestaurantFormActions } from '@/components/restaurant/RestaurantFormActions';
import { useFollowUpTaskManager } from '@/hooks/useFollowUpTaskManager';

const NewRestaurantPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { createFollowUpTask } = useFollowUpTaskManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpData, setFollowUpData] = useState<any>(null);
  
  const isAdmin = hasAdminAccess(profile?.role);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    township: '',
    phone: '',
    contact_person: '',
    remarks: '',
    salesperson_id: profile?.id || '',
  });

  const handleFollowUpSubmit = (data: any) => {
    // Auto-generate the task title based on restaurant name
    const taskTitle = formData.name ? `Follow up with ${formData.name}` : 'Follow up with restaurant';
    setFollowUpData({
      ...data,
      title: taskTitle
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create restaurants",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name,
          address: formData.address,
          township: formData.township,
          phone: formData.phone,
          contact_person: formData.contact_person,
          remarks: formData.remarks,
          salesperson_id: formData.salesperson_id,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Create follow-up task if scheduled
      if (followUpData && restaurantData?.id) {
        await createFollowUpTask.mutateAsync({
          ...followUpData,
          restaurantId: restaurantData.id,
        });
      }

      toast({
        title: "Restaurant created successfully",
        description: `The new restaurant has been added to the system${followUpData ? ' with follow-up task scheduled' : ''}`,
      });

      navigate('/restaurants');
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast({
        title: "Error creating restaurant",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.township && formData.salesperson_id;

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/restaurants')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Restaurants
          </Button>
          <h1 className="text-2xl font-bold tracking-tight ml-4">New Restaurant</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RestaurantFormFields
            formData={formData}
            setFormData={setFormData}
            profile={profile}
          />

          <RestaurantFollowUpForm
            onSubmit={handleFollowUpSubmit}
            isLoading={isSubmitting}
            defaultAssignee={formData.salesperson_id}
            restaurantName={formData.name}
          />

          <RestaurantFormActions
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            usersLoading={usersLoading}
            isAdmin={isAdmin}
            onCancel={() => navigate('/restaurants')}
          />
        </form>
      </div>
    </div>
  );
};

export default NewRestaurantPage;
