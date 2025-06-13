import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks/useLeads';
import RestaurantSelector from '@/components/restaurant/RestaurantSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';
import { RestaurantFollowUpForm } from '@/components/restaurant/RestaurantFollowUpForm';
import { useFollowUpTaskManager } from '@/hooks/useFollowUpTaskManager';

interface RestaurantData {
  id?: string;
  name: string;
  address: string;
  township: string;
  phone: string;
  contact_person: string;
  remarks: string;
  isNew: boolean;
}

const NewLeadPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { createFollowUpTask } = useFollowUpTaskManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantData | null>(null);
  const [assignedToUserId, setAssignedToUserId] = useState(profile?.id || '');
  const [followUpData, setFollowUpData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !selectedRestaurant) return;

    setIsSubmitting(true);

    try {
      let restaurantId: string;

      if (selectedRestaurant.isNew) {
        // Create new restaurant first
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            name: selectedRestaurant.name,
            address: selectedRestaurant.address,
            township: selectedRestaurant.township,
            phone: selectedRestaurant.phone,
            contact_person: selectedRestaurant.contact_person,
            remarks: selectedRestaurant.remarks,
            salesperson_id: assignedToUserId,
          })
          .select('id')
          .single();

        if (restaurantError) {
          throw restaurantError;
        }

        restaurantId = restaurantData.id;
      } else {
        // Use existing restaurant
        restaurantId = selectedRestaurant.id!;
      }

      // Create the lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          restaurant_id: restaurantId,
          name: selectedRestaurant.name,
          assigned_to_user_id: assignedToUserId,
          status: 'CONTACT_STAGE',
          source: 'Manual Entry',
        });

      if (leadError) {
        throw leadError;
      }

      // Create follow-up task if scheduled
      if (followUpData) {
        await createFollowUpTask.mutateAsync({
          ...followUpData,
          restaurantId,
        });
      }

      toast({
        title: "Lead created successfully",
        description: `The new lead for ${selectedRestaurant.name} has been added to the pipeline${followUpData ? ' with follow-up task scheduled' : ''}`,
      });

      navigate('/leads');
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error creating lead",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpSubmit = (data: any) => {
    setFollowUpData(data);
  };

  const isFormValid = selectedRestaurant && assignedToUserId && 
    (selectedRestaurant.isNew ? selectedRestaurant.name && selectedRestaurant.township : true);

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Leads
          </Button>
          <h1 className="text-2xl font-bold tracking-tight ml-4">New Lead</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <RestaurantSelector
                onRestaurantSelect={setSelectedRestaurant}
                selectedRestaurant={selectedRestaurant}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To *</Label>
                {usersLoading ? (
                  <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : (
                  <Select
                    value={assignedToUserId}
                    onValueChange={setAssignedToUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to assign this lead to" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <RestaurantFollowUpForm
            onSubmit={handleFollowUpSubmit}
            isLoading={isSubmitting}
            defaultAssignee={assignedToUserId}
          />

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormValid || usersLoading} 
              className="flex-1"
            >
              {isSubmitting ? 'Creating Lead...' : 'Create Lead'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/leads')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadPage;
