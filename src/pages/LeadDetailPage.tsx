
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeadDetailPage = () => {
  const { id } = useParams();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          restaurant:restaurants(name, township, address),
          assigned_user:users!leads_assigned_to_user_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ModernDashboardLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (!lead) {
    return (
      <ModernDashboardLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Lead not found</h1>
            <Link to="/leads">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Button>
            </Link>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/leads">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
          </div>
          <Link to={`/leads/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div>
                  <Badge variant="outline">{lead.status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                <p>{lead.assigned_user?.full_name || 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <p>{lead.source || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Action</label>
                <p>{lead.next_action_description || 'No action scheduled'}</p>
              </div>
              {lead.next_action_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Action Date</label>
                  <p>{new Date(lead.next_action_date).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Restaurant Name</label>
                <p>{lead.restaurant?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Township</label>
                <p>{lead.restaurant?.township}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p>{lead.restaurant?.address || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {lead.stage_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lead.stage_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernDashboardLayout>
  );
};

export default LeadDetailPage;
