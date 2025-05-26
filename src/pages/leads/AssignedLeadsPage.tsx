
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useLeads } from '@/hooks/useLeads';
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
import ConvertToOrderButton from '@/components/leads/ConvertToOrderButton';
import { Search, Clipboard } from 'lucide-react';
import { format } from 'date-fns';

const LEAD_STATUSES = [
  { value: 'CONTACT_STAGE', label: 'Initial Contact', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEETING_STAGE', label: 'Meeting Scheduled', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PRESENTATION_NEGOTIATION', label: 'Proposal/Negotiation', color: 'bg-purple-100 text-purple-800' },
  { value: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
];

const AssignedLeadsPage = () => {
  const navigate = useNavigate();
  const { leads, isLoading, error, updateLeadStatus } = useLeads(true); // Only assigned leads
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your assigned leads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading leads: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Clipboard className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assigned to Me</h1>
            <p className="text-muted-foreground">
              View and manage leads that have been assigned to you ({filteredLeads.length} total)
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your leads by name, restaurant, or township..."
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
                <Clipboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assigned leads found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'No leads match your current filters' 
                    : 'You don\'t have any leads assigned to you yet'
                  }
                </p>
                {!searchTerm && statusFilter === 'ALL' && (
                  <Button onClick={() => navigate('/leads')}>
                    View All Leads
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Action</TableHead>
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
                      <TableCell>{lead.restaurant.phone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {lead.next_action_description ? (
                            <div>
                              <p className="text-sm truncate">{lead.next_action_description}</p>
                              {lead.next_action_date && (
                                <p className="text-xs text-muted-foreground">
                                  Due: {format(new Date(lead.next_action_date), 'MMM dd, yyyy')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No action set</span>
                          )}
                        </div>
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
    </DashboardLayout>
  );
};

export default AssignedLeadsPage;
