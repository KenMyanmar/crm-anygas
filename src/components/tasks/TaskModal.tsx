
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedTasks } from '@/hooks/useEnhancedTasks';
import { useAuth } from '@/context/AuthContext';
import { EnhancedTask } from '@/types/calendar';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: EnhancedTask;
}

export const TaskModal = ({ open, onClose, task }: TaskModalProps) => {
  const { profile } = useAuth();
  const { createTask, updateTask } = useEnhancedTasks();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    task_type: task?.task_type || 'other',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    estimated_duration_minutes: task?.estimated_duration_minutes || '',
    assigned_to_user_id: task?.assigned_to_user_id || profile?.id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;

    const taskData = {
      ...formData,
      created_by_user_id: profile.id,
      estimated_duration_minutes: formData.estimated_duration_minutes ? 
        parseInt(formData.estimated_duration_minutes) : undefined,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...taskData });
      } else {
        await createTask.mutateAsync(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task_type">Task Type *</Label>
              <Select value={formData.task_type} onValueChange={(value) => handleChange('task_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration_minutes">Duration (minutes)</Label>
              <Input
                id="estimated_duration_minutes"
                type="number"
                value={formData.estimated_duration_minutes}
                onChange={(e) => handleChange('estimated_duration_minutes', e.target.value)}
                placeholder="60"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
              {task ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
