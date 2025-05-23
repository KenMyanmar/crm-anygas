
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Restaurant } from '@/types';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const orderFormSchema = z.object({
  restaurant_id: z.string({
    required_error: "Restaurant is required",
  }),
  delivery_date: z.date().optional(),
  items: z.array(
    z.object({
      product_name: z.string().min(1, "Product name is required"),
      quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      unit_price_kyats: z.coerce.number().min(1, "Price must be greater than 0"),
    })
  ).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const NewOrderPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      items: [{ product_name: '', quantity: 1, unit_price_kyats: 0 }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);
  
  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, township')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Ensure we have a complete Restaurant object by setting default values for required fields
      const completeRestaurants = (data || []).map(restaurant => ({
        ...restaurant,
        phone_primary: restaurant.phone || '', // Use existing phone or empty string
        created_at: restaurant.created_at || new Date().toISOString(),
        updated_at: restaurant.updated_at || new Date().toISOString()
      })) as Restaurant[];

      setRestaurants(completeRestaurants);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error fetching restaurants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = (index: number) => {
    const item = form.watch(`items.${index}`);
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price_kyats) || 0;
    return quantity * unitPrice;
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((sum, item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price_kyats) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const onSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Calculate total amount
      const total_amount_kyats = values.items.reduce((total, item) => {
        return total + (item.quantity * item.unit_price_kyats);
      }, 0);

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: values.restaurant_id,
          total_amount_kyats,
          delivery_date_scheduled: values.delivery_date ? values.delivery_date.toISOString() : null,
          notes: values.notes,
          created_by_user_id: user.id,
        })
        .select('id')
        .single();

      if (orderError) {
        throw orderError;
      }

      const orderId = orderData.id;

      // Insert order items
      const orderItems = values.items.map(item => ({
        order_id: orderId,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price_kyats: item.unit_price_kyats,
        sub_total_kyats: item.quantity * item.unit_price_kyats,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      toast({
        title: "Order created",
        description: "The order has been created successfully",
      });

      // Navigate to orders page
      navigate('/orders');

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Button>
            <h1 className="text-2xl font-bold tracking-tight ml-4">New Order</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="restaurant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a restaurant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem key={restaurant.id} value={restaurant.id}>
                              {restaurant.name} {restaurant.township ? `(${restaurant.township})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Delivery Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Select a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_name: '', quantity: 1, unit_price_kyats: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => {
                                    const currentValue = parseInt(field.value.toString() || "0");
                                    if (currentValue > 1) {
                                      field.onChange(currentValue - 1);
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  {...field}
                                  className="mx-2 text-center"
                                  type="number"
                                  min="1"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange(value < 1 ? 1 : value);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => {
                                    const currentValue = parseInt(field.value.toString() || "0");
                                    field.onChange(currentValue + 1);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price_kyats`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price (Kyats)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="text-right text-sm font-medium">
                      <span className="text-muted-foreground">Subtotal:</span>{" "}
                      {calculateSubtotal(index).toLocaleString()} Kyats
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No items added to this order yet.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-muted-foreground">Total Items: {fields.length}</div>
                <div className="text-lg font-semibold">
                  Total: {calculateTotal().toLocaleString()} Kyats
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any special instructions or notes about this order"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/orders')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewOrderPage;
