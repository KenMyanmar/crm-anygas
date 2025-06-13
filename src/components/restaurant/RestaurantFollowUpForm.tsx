
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUsers } from '@/hooks/useLeads';

interface FollowUpFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  assignedToUserId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface RestaurantFollowUpFormProps {
  onSubmit: (followUpData: FollowUpFormData) => void;
  isLoading?: boolean;
  defaultAssignee?: string;
}

export const RestaurantFollowUpForm: React.FC<RestaurantFollowUpFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultAssignee
}) => {
  const { users } = useUsers();
  const [isEnabled, setIsEnabled] = useState(false);
  const [formData, setFormData] = useState<FollowUpFormData>({
    title: 'Follow up with restaurant',
    description: '',
    dueDate: '',
    dueTime: '09:00',
    assignedToUserId: defaultAssignee || '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEnabled && formData.dueDate && formData.assignedToUserId) {
      onSubmit(formData);
    }
  };

  const handleFieldChange = (field: keyof FollowUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get tomorrow's date as default minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Schedule Follow-up Task
          </CardTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            id="follow-up-toggle"
          />
        </div>
      </CardHeader>
      
      {isEnabled && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="follow-up-title">Task Title</Label>
                <Input
                  id="follow-up-title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Follow up with restaurant"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-assignee">Assign To</Label>
                <Select
                  value={formData.assignedToUserId}
                  onValueChange={(value) => handleFieldChange('assignedToUserId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {user.full_name} ({user.role})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-date">Due Date</Label>
                <Input
                  id="follow-up-date"
                  type="date"
                  min={minDate}
                  value={formData.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-time">Due Time</Label>
                <Input
                  id="follow-up-time"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleFieldChange('dueTime', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    handleFieldChange('priority', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="follow-up-description">Description (Optional)</Label>
              <Textarea
                id="follow-up-description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Add notes about what to discuss during follow-up..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                The assigned user will receive a notification 1 hour before the due time. 
                If not completed on time, managers will be notified for escalation.
              </span>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
};
