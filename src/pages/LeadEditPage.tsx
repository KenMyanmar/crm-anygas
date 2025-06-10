
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const LeadEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    name: '',
    status: 'CONTACT_STAGE',
    source: '',
    next_action_description: '',
    next_action_date: '',
    stage_notes: '',
  });

  // Update form data when lead is loaded
  React.useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        status: lead.status || 'CONTACT_STAGE',
        source: lead.source || '',
        next_action_description: lead.next_action_description || '',
        next_action_date: lead.next_action_date ? new Date(lead.next_action_date).toISOString().slice(0, 16) : '',
        stage_notes: lead.stage_notes || '',
      });
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
      navigate(`/leads/${id}`);
    },
    onError: (error) => {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      next_action_date: formData.next_action_date || null,
      updated_at: new Date().toISOString(),
    };

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link to={`/leads/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Lead</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Lead Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONTACT_STAGE">Contact Stage</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="PROPOSAL">Proposal</SelectItem>
                    <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                    <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                    <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="e.g., Referral, Cold Call, Website"
                />
              </div>

              <div>
                <Label htmlFor="next_action_description">Next Action</Label>
                <Input
                  id="next_action_description"
                  value={formData.next_action_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_action_description: e.target.value }))}
                  placeholder="Describe the next action to take"
                />
              </div>

              <div>
                <Label htmlFor="next_action_date">Next Action Date</Label>
                <Input
                  id="next_action_date"
                  type="datetime-local"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_action_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="stage_notes">Notes</Label>
                <Textarea
                  id="stage_notes"
                  value={formData.stage_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, stage_notes: e.target.value }))}
                  rows={4}
                  placeholder="Add notes about this lead..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Link to={`/leads/${id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LeadEditPage;
