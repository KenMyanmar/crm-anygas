
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks/useLeads';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';

const NewLeadPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    township: '',
    phone: '',
    contact_person: '',
    remarks: '',
    assigned_to_user_id: profile?.id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);

    try {
      // First create the restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name,
          address: formData.address,
          township: formData.township,
          phone: formData.phone,
          contact_person: formData.contact_person,
          remarks: formData.remarks,
          salesperson_id: formData.assigned_to_user_id,
        })
        .select('id')
        .single();

      if (restaurantError) {
        throw restaurantError;
      }

      // Then create the lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          restaurant_id: restaurantData.id,
          name: formData.name,
          assigned_to_user_id: formData.assigned_to_user_id,
          status: 'CONTACT_STAGE',
          source: 'Manual Entry',
        });

      if (leadError) {
        throw leadError;
      }

      toast({
        title: "Lead created successfully",
        description: "The new lead has been added to the pipeline",
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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Leads
            </Button>
            <h1 className="text-2xl font-bold tracking-tight ml-4">New Lead</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter restaurant name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="township">Township</Label>
                    <Input
                      id="township"
                      value={formData.township}
                      onChange={(e) => setFormData({ ...formData, township: e.target.value })}
                      placeholder="Enter township"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To *</Label>
                  <Select
                    value={formData.assigned_to_user_id}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to_user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to assign this lead to" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersLoading ? (
                        <SelectItem value="" disabled>Loading users...</SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter any additional notes or remarks"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.assigned_to_user_id} 
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewLeadPage;
