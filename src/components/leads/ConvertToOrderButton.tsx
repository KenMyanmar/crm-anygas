
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface ConvertToOrderButtonProps {
  leadId: string;
  restaurantId: string;
  restaurantName: string;
  isWonLead: boolean;
}

const ConvertToOrderButton = ({ leadId, restaurantId, restaurantName, isWonLead }: ConvertToOrderButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to convert leads to orders');
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      // Create the order with the required created_by_user_id field
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          restaurant_id: restaurantId,
          lead_id: leadId,
          status: 'PENDING_CONFIRMATION',
          total_amount_kyats: 0,
          created_by_user_id: user.id, // This was missing and causing the RLS error
          notes: `Converted from lead for ${restaurantName}`
        })
        .select()
        .single();

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          target_id: leadId,
          target_type: 'LEAD',
          activity_message: `Lead converted to order ${orderNumber}`
        });

      toast({
        title: "Success",
        description: `Lead converted to order ${orderNumber}`,
      });

      setIsOpen(false);
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      console.error('Error converting lead to order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert lead to order",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!isWonLead) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Convert to Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Lead to Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create a new order for <strong>{restaurantName}</strong> and link it to this lead.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleConvert} 
              disabled={isConverting}
              className="flex-1"
            >
              {isConverting ? 'Converting...' : 'Create Order'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isConverting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToOrderButton;
