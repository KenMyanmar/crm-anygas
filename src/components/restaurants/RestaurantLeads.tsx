
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { formatDate } from '@/lib/supabase';

interface Lead {
  id: string;
  name: string;
  status: string;
  next_action_description: string | null;
  next_action_date: string | null;
  created_at: string;
}

interface RestaurantLeadsProps {
  restaurantId: string;
}

const RestaurantLeads = ({ restaurantId }: RestaurantLeadsProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setLeads(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching leads",
          description: error.message || "Failed to load leads for this restaurant",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [restaurantId]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'CONTACTED':
        return 'bg-purple-100 text-purple-800';
      case 'NEEDS_FOLLOW_UP':
        return 'bg-yellow-100 text-yellow-800';
      case 'WON':
        return 'bg-green-100 text-green-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            All leads associated with this restaurant
          </CardDescription>
        </div>
        <Button asChild>
          <Link to={`/leads/new?restaurantId=${restaurantId}`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Lead
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No leads found for this restaurant
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link to={`/leads/${lead.id}`} className="hover:underline">
                        {lead.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(lead.status)}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.next_action_description ? (
                        <div>
                          <p className="text-sm">{lead.next_action_description}</p>
                          {lead.next_action_date && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(lead.next_action_date)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No action scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(lead.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantLeads;
