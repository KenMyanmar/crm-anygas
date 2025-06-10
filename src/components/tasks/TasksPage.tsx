
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { TaskFilters } from './TaskFilters';
import { useEnhancedTasks } from '@/hooks/useEnhancedTasks';
import { useAuth } from '@/context/AuthContext';
import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const TasksPage = () => {
  const { profile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({});

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'pending':
        return { ...filters, status: ['pending'] };
      case 'in_progress':
        return { ...filters, status: ['in_progress'] };
      case 'completed':
        return { ...filters, status: ['completed'] };
      case 'my_tasks':
        return { ...filters, assignedTo: profile?.id };
      default:
        return filters;
    }
  };

  const { tasks, isLoading } = useEnhancedTasks(getFilteredTasks());

  const taskCounts = {
    all: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    my_tasks: tasks?.filter(t => t.assigned_to_user_id === profile?.id).length || 0,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage all your tasks, follow-ups, and action items
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <TaskFilters onFiltersChange={setFilters} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              All ({taskCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({taskCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              In Progress ({taskCounts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Completed ({taskCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="my_tasks" className="flex items-center gap-2">
              My Tasks ({taskCounts.my_tasks})
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks || []} 
                isLoading={isLoading}
                onTaskUpdate={() => {
                  // Refresh tasks
                }}
              />
            </CardContent>
          </Card>
        </Tabs>

        <TaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
