
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface TaskFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export const TaskFilters = ({ onFiltersChange }: TaskFiltersProps) => {
  const [filters, setFilters] = useState({
    taskType: '',
    priority: '',
    dueDateRange: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert to API filter format
    const apiFilters: any = {};
    
    if (newFilters.taskType) {
      apiFilters.taskType = [newFilters.taskType];
    }
    
    if (newFilters.priority) {
      apiFilters.priority = [newFilters.priority];
    }
    
    if (newFilters.dueDateRange) {
      const today = new Date();
      switch (newFilters.dueDateRange) {
        case 'overdue':
          apiFilters.dueDate = today.toISOString();
          break;
        case 'today':
          apiFilters.dueDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          apiFilters.dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }
    
    onFiltersChange(apiFilters);
  };

  const clearFilters = () => {
    setFilters({
      taskType: '',
      priority: '',
      dueDateRange: '',
    });
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Filters</Label>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select value={filters.taskType} onValueChange={(value) => handleFilterChange('taskType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="lead_followup">Lead Follow-up</SelectItem>
                <SelectItem value="meeting_prep">Meeting Preparation</SelectItem>
                <SelectItem value="uco_collection">UCO Collection</SelectItem>
                <SelectItem value="order_followup">Order Follow-up</SelectItem>
                <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
                <SelectItem value="admin">Administrative</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDateRange">Due Date</Label>
            <Select value={filters.dueDateRange} onValueChange={(value) => handleFilterChange('dueDateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due today</SelectItem>
                <SelectItem value="week">Due this week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
