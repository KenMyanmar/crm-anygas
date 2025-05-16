
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const PendingOrdersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Package className="h-6 w-6 text-amber-500" />
        <h1 className="text-2xl font-bold tracking-tight">Pending Orders</h1>
      </div>
      <p className="text-muted-foreground">
        View and manage all orders that are awaiting delivery or fulfillment.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Orders Awaiting Fulfillment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Pending Orders Management Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will allow you to track and manage all pending gas cylinder orders.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>View all pending orders with expected delivery dates</li>
              <li>Sort and filter by restaurant, date, or order size</li>
              <li>Update order status and delivery information</li>
              <li>Send notifications to customers about order status</li>
              <li>Generate delivery manifests for logistics team</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingOrdersPage;
