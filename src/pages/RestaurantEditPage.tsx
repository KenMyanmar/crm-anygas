
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  township: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  contact_person: z.string().nullable(),
  remarks: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const RestaurantEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      township: '',
      address: '',
      phone: '',
      contact_person: '',
      remarks: '',
    },
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Initialize form with restaurant data
        form.reset({
          name: data.name || '',
          township: data.township || '',
          address: data.address || '',
          phone: data.phone || '',
          contact_person: data.contact_person || '',
          remarks: data.remarks || '',
        });
      } catch (error: any) {
        toast({
          title: "Error fetching restaurant details",
          description: error.message || "Failed to load restaurant details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, form]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: values.name,
          township: values.township,
          address: values.address,
          phone: values.phone,
          contact_person: values.contact_person,
          remarks: values.remarks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Restaurant updated",
        description: "The restaurant details have been successfully updated.",
      });
      
      // Navigate back to the restaurant details page
      navigate(`/restaurants/${id}`);
    } catch (error: any) {
      toast({
        title: "Error updating restaurant",
        description: error.message || "Failed to update restaurant details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading restaurant details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild size="sm">
              <Link to={`/restaurants/${id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Details
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit Restaurant</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="township"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Township</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ''} 
                          rows={3}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ''} 
                          rows={4}
                          className="resize-none"
                          placeholder="Any additional notes about this restaurant..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/restaurants/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    {isSaving && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantEditPage;
