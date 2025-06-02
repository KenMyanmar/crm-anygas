import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, RefreshCcw, Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OrderDashboardStats from '@/components/orders/OrderDashboardStats';
import SimpleOrdersTable from '@/components/orders/SimpleOrdersTable';

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine initial tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes('/process')) return 'process';
    if (location.pathname.includes('/delivered')) return 'delivered';
    return 'pending';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [townshipFilter, setTownshipFilter] = useState('all');
  
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all orders from database...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(id, name, township)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} orders`);
      console.log('Orders by status:', data?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      setAllOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by search and township
  function searchFilteredOrders() {
    return allOrders.filter(order => {
      const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTownship = townshipFilter === 'all' || order.restaurant?.township === townshipFilter;
      return matchesSearch && matchesTownship;
    });
  }

  // Filter by tab status
  function getOrdersForTab(tab: string) {
    const filtered = (() => {
      switch (tab) {
        case 'pending':
          return searchFilteredOrders().filter(order => order.status === 'PENDING_CONFIRMATION');
        case 'process':
          return searchFilteredOrders().filter(order => ['CONFIRMED', 'OUT_FOR_DELIVERY'].includes(order.status));
        case 'delivered':
          return searchFilteredOrders().filter(order => order.status === 'DELIVERED');
        default:
          return searchFilteredOrders();
      }
    })();
    
    console.log(`Orders for ${tab} tab:`, filtered.length);
    return filtered;
  }

  // Calculate stats from ALL orders (not filtered)
  function getOrderStats() {
    const stats = {
      pendingCount: allOrders.filter(o => o.status === 'PENDING_CONFIRMATION').length,
      confirmedCount: allOrders.filter(o => ['CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
      deliveredCount: allOrders.filter(o => o.status === 'DELIVERED').length,
      totalRevenue: allOrders.reduce((sum, o) => sum + (o.total_amount_kyats || 0), 0)
    };
    
    console.log('Order stats:', stats);
    return stats;
  }

  const getTownships = () => {
    const townships = [...new Set(allOrders.map(o => o.restaurant?.township).filter(Boolean))];
    return townships.sort();
  };

  const handleOrderUpdated = () => {
    console.log('Order updated, refreshing data...');
    fetchAllOrders();
  };

  const stats = getOrderStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage orders through their workflow: Pending → In Process → Delivered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchAllOrders} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/orders/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      <OrderDashboardStats stats={stats} />

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Order Workflow Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={townshipFilter} onValueChange={setTownshipFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by township" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Townships</SelectItem>
                  {getTownships().map((township) => (
                    <SelectItem key={township} value={township}>
                      {township}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-100">
                Pending Orders ({stats.pendingCount})
              </TabsTrigger>
              <TabsTrigger value="process" className="data-[state=active]:bg-blue-100">
                In Process ({stats.confirmedCount})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="data-[state=active]:bg-green-100">
                Delivered ({stats.deliveredCount})
              </TabsTrigger>
            </TabsList>

            {['pending', 'process', 'delivered'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <SimpleOrdersTable 
                  orders={getOrdersForTab(tab)} 
                  isLoading={isLoading} 
                  onOrderUpdated={handleOrderUpdated}
                  currentTab={tab}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
