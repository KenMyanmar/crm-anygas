
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedTask } from '@/types/calendar';
import { useEnhancedTasks } from '@/hooks/useEnhancedTasks';
import { format } from 'date-fns';
import { Calendar, User, Flag, Clock, CheckSquare, Edit } from 'lucide-react';

interface TaskListProps {
  tasks: EnhancedTask[];
  isLoading: boolean;
  onTaskUpdate: () => void;
}

export const TaskList = ({ tasks, isLoading, onTaskUpdate }: TaskListProps) => {
  const { completeTask, updateTask } = useEnhancedTasks();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const handleCompleteTask = async (task: EnhancedTask) => {
    await completeTask.mutateAsync({ id: task.id });
    onTaskUpdate();
  };

  const handleToggleStatus = async (task: EnhancedTask) => {
    const newStatus = task.status === 'pending' ? 'in_progress' : 
                     task.status === 'in_progress' ? 'completed' : 'pending';
    
    await updateTask.mutateAsync({ 
      id: task.id, 
      status: newStatus,
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
    });
    onTaskUpdate();
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'lead_followup': return 'bg-blue-100 text-blue-800';
      case 'meeting_prep': return 'bg-green-100 text-green-800';
      case 'uco_collection': return 'bg-purple-100 text-purple-800';
      case 'order_followup': return 'bg-orange-100 text-orange-800';
      case 'customer_satisfaction': return 'bg-pink-100 text-pink-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Create your first task to get started with task management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className={`transition-all hover:shadow-md ${
          task.status === 'completed' ? 'opacity-75' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => handleToggleStatus(task)}
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getTaskTypeColor(task.task_type)}>
                      {task.task_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {task.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {format(new Date(task.due_date), 'PPp')}</span>
                    </div>
                  )}
                  
                  {task.estimated_duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_duration_minutes}m</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Created: {format(new Date(task.created_at), 'MMM d')}</span>
                  </div>
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {expandedTask === task.id && task.completion_notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Completion Notes:</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.completion_notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedTask(
                    expandedTask === task.id ? null : task.id
                  )}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
