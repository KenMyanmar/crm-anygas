
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Download, RefreshCw } from "lucide-react";
import { useDeliveredOrders } from "@/hooks/useDeliveredOrders";
import DeliveredOrdersFilters from "@/components/orders/DeliveredOrdersFilters";
import DeliveredOrdersTable from "@/components/orders/DeliveredOrdersTable";
import DeliveredOrdersStats from "@/components/orders/DeliveredOrdersStats";
import { getUserRole } from "@/utils/roleUtils";
import { useEffect, useState } from "react";

const DeliveredOrdersPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const {
    orders,
    isLoading,
    searchTerm,
    setSearchTerm,
    townshipFilter,
    setTownshipFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    clearFilters,
    refetch
  } = useDeliveredOrders();

  // Debug user role on page load
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await getUserRole();
        console.log('🌟 DeliveredOrdersPage: Current user role:', role);
        setUserRole(role);
      } catch (error) {
        console.error('❌ DeliveredOrdersPage: Error getting user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Order Number', 'Restaurant', 'Township', 'Contact Person', 'Order Date', 'Scheduled Delivery', 'Actual Delivery', 'Amount (Kyats)', 'Items Count', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.order_number,
        `"${order.restaurant.name}"`,
        order.restaurant.township || '',
        `"${order.restaurant.contact_person || ''}"`,
        order.order_date,
        order.delivery_date_scheduled,
        order.delivery_date_actual,
        order.total_amount_kyats,
        order.order_items.length,
        `"${order.notes || ''}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `delivered-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Debug rendering info
  console.log('🧩 DeliveredOrdersPage rendering:', {
    userRole,
    ordersCount: orders.length,
    isLoading
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight">Delivered Orders</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || orders.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">
        Track and analyze all completed orders that have been successfully delivered to restaurants.
      </p>

      <DeliveredOrdersStats orders={orders} />

      <DeliveredOrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        townshipFilter={townshipFilter}
        setTownshipFilter={setTownshipFilter}
        dateFromFilter={dateFromFilter}
        setDateFromFilter={setDateFromFilter}
        dateToFilter={dateToFilter}
        setDateToFilter={setDateToFilter}
        clearFilters={clearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Delivered Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveredOrdersTable 
            orders={orders} 
            isLoading={isLoading} 
            onOrdersDeleted={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveredOrdersPage;
