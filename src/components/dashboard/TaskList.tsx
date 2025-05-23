import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AlertCircle, Filter, Check, X } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  restaurant_name: string;
  next_action_description: string;
  next_action_date: string;
  status: LeadStatus;
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (id: string) => void;
  showFilters?: boolean;
}

const getStatusColor = (status: LeadStatus): string => {
  switch(status) {
    case 'CONTACT_STAGE':
      return 'bg-purple-500';
    case 'MEETING_STAGE':
      return 'bg-amber-500';
    case 'PRESENTATION_NEGOTIATION':
      return 'bg-teal-500';
    case 'CLOSED_WON':
      return 'bg-green-500';
    case 'CLOSED_LOST':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const bgColor = getStatusColor(status);
  
  return (
    <div className="flex items-center">
      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${bgColor}`}></span>
      <span className="text-xs capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
    </div>
  );
};

const TaskList = ({ tasks, onTaskClick, showFilters = false }: TaskListProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'status' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleClick = (id: string) => {
    if (onTaskClick) {
      onTaskClick(id);
    }
  };

  const handleSort = (field: 'date' | 'status' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  let filteredTasks = [...tasks];
  
  if (filter) {
    filteredTasks = filteredTasks.filter(task => task.status === filter);
  }
  
  // Sort tasks
  filteredTasks.sort((a, b) => {
    if (sortField === 'date') {
      const dateA = parseISO(a.next_action_date);
      const dateB = parseISO(b.next_action_date);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    } else if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else {
      return sortDirection === 'asc'
        ? a.restaurant_name.localeCompare(b.restaurant_name)
        : b.restaurant_name.localeCompare(a.restaurant_name);
    }
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>My Tasks</CardTitle>
        {showFilters && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter(null)}>
                <Check className={`h-4 w-4 mr-1 ${!filter ? 'opacity-100' : 'opacity-0'}`} />
                All
              </DropdownMenuItem>
              {['CONTACT_STAGE', 'MEETING_STAGE', 'PRESENTATION_NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].map(
                (status) => (
                  <DropdownMenuItem key={status} onClick={() => setFilter(status)}>
                    <Check className={`h-4 w-4 mr-1 ${filter === status ? 'opacity-100' : 'opacity-0'}`} />
                    {status.toLowerCase().replace(/_/g, ' ')}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No tasks found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer w-[180px]"
                  onClick={() => handleSort('name')}
                >
                  Restaurant
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead 
                  className="cursor-pointer w-[100px]"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right w-[100px]"
                  onClick={() => handleSort('date')}
                >
                  Due Date
                  {sortField === 'date' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => {
                const actionDate = parseISO(task.next_action_date);
                const formattedDate = format(actionDate, 'MMM d, yyyy');
                const isOverdue = isPast(actionDate) && !isToday(actionDate);
                const isTodayAction = isToday(actionDate);
                
                return (
                  <TableRow 
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleClick(task.id)}
                  >
                    <TableCell className="font-medium">{task.restaurant_name}</TableCell>
                    <TableCell>{task.next_action_description}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={isOverdue ? "destructive" : isTodayAction ? "default" : "outline"}>
                        {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                        {formattedDate}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        {tasks.length > 10 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm">
              View All Tasks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
