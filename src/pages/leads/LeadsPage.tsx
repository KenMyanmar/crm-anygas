import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LeadStatusSelect from '@/components/leads/LeadStatusSelect';
import LeadAssignmentSelect from '@/components/leads/LeadAssignmentSelect';
import ConvertToOrderButton from '@/components/leads/ConvertToOrderButton';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const LEAD_STATUSES = [
  { value: 'CONTACT_STAGE', label: 'Initial Contact', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEETING_STAGE', label: 'Meeting Scheduled', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PRESENTATION_NEGOTIATION', label: 'Proposal/Negotiation', color: 'bg-purple-100 text-purple-800' },
  { value: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
];

const LeadsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { leads, isLoading, error, updateLeadStatus, updateLeadAssignment } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusInfo = LEAD_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading leads: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all leads in your pipeline
          </p>
        </div>
        <Button onClick={() => navigate('/leads/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, restaurant, or township..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="ALL">All Statuses</option>
              {LEAD_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No leads match your filters' 
                  : 'No leads found'
                }
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <Button onClick={() => navigate('/leads/new')}>
                  Create Your First Lead
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Township</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.restaurant.name}</TableCell>
                    <TableCell>{lead.restaurant.township || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <LeadAssignmentSelect
                        currentAssignedUserId={lead.assigned_to_user_id}
                        currentAssignedUserName={lead.assigned_user.full_name}
                        onAssignmentUpdate={(newUserId) => 
                          updateLeadAssignment(lead.id, newUserId)
                        }
                        leadName={lead.name}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <LeadStatusSelect
                          currentStatus={lead.status}
                          onStatusUpdate={(newStatus, notes) => 
                            updateLeadStatus(lead.id, newStatus, notes)
                          }
                          leadName={lead.name}
                        />
                        <ConvertToOrderButton
                          leadId={lead.id}
                          restaurantId={lead.restaurant_id}
                          restaurantName={lead.restaurant.name}
                          isWonLead={lead.status === 'CLOSED_WON'}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsPage;
