
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { VisitTask } from '@/types/visits';

const outcomeSchema = z.object({
  lead_status: z.enum(['CONTACT_STAGE', 'MEETING_STAGE', 'PRESENTATION_NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  next_action: z.string().optional(),
  next_action_date: z.date().optional(),
  create_order: z.boolean().default(false),
  order_notes: z.string().optional(),
  outcome_notes: z.string().optional(),
});

type OutcomeFormData = z.infer<typeof outcomeSchema>;

interface TaskOutcomeFormProps {
  task: VisitTask;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const TaskOutcomeForm = ({ task, onSubmit, isSubmitting }: TaskOutcomeFormProps) => {
  const [createOrder, setCreateOrder] = useState(false);

  const form = useForm<OutcomeFormData>({
    resolver: zodResolver(outcomeSchema),
    defaultValues: {
      lead_status: task.lead_status || 'CONTACT_STAGE',
      next_action: '',
      next_action_date: undefined,
      create_order: false,
      order_notes: '',
      outcome_notes: '',
    },
  });

  const handleSubmit = async (data: OutcomeFormData) => {
    const outcomeData = {
      lead_status: data.lead_status,
      next_action: data.next_action,
      next_action_date: data.next_action_date?.toISOString(),
      order_id: createOrder ? 'placeholder-order-id' : null, // Would be replaced with actual order creation
      notes: data.outcome_notes,
    };

    await onSubmit(outcomeData);
  };

  const leadStatusOptions = [
    { value: 'CONTACT_STAGE', label: 'Contact Stage' },
    { value: 'MEETING_STAGE', label: 'Meeting Stage' },
    { value: 'PRESENTATION_NEGOTIATION', label: 'Presentation/Negotiation' },
    { value: 'CLOSED_WON', label: 'Closed Won' },
    { value: 'CLOSED_LOST', label: 'Closed Lost' },
  ];

  const handleCreateOrderChange = (checked: boolean | "indeterminate") => {
    setCreateOrder(checked === true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Outcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Lead Status */}
            <FormField
              control={form.control}
              name="lead_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Action */}
            <FormField
              control={form.control}
              name="next_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Action Required</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the next steps to be taken..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Action Date */}
            <FormField
              control={form.control}
              name="next_action_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Action Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Create Order Option */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create_order"
                  checked={createOrder}
                  onCheckedChange={handleCreateOrderChange}
                />
                <label
                  htmlFor="create_order"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Create order for this restaurant
                </label>
              </div>

              {createOrder && (
                <FormField
                  control={form.control}
                  name="order_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about the order..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* General Notes */}
            <FormField
              control={form.control}
              name="outcome_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this visit..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Outcome'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TaskOutcomeForm;
