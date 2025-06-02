
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OrdersPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <p className="text-muted-foreground">
        This page will manage new and existing orders for Easy Gas cylinders, including creation, status updates, and history.
      </p>
      
      <div className="border border-dashed rounded-lg p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Order Management Coming Soon</h2>
        <p className="text-muted-foreground">
          The full implementation will include:
        </p>
        <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
          <li>Create new orders for existing restaurants</li>
          <li>Convert leads to orders for WON status leads</li>
          <li>Track order status through the fulfillment process</li>
          <li>Update delivery dates and notes</li>
          <li>View order history by restaurant</li>
          <li>Calculate and display order totals</li>
        </ul>
      </div>
    </div>
  );
};

export default OrdersPage;
