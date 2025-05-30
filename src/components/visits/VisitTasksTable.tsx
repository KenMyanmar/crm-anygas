import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageCircle
} from 'lucide-react';
import { VisitTask } from '@/types/visits';
import { format } from 'date-fns';
import VisitCommentsSection from './VisitCommentsSection';

interface VisitTasksTableProps {
  tasks: VisitTask[];
  onStatusChange: (taskId: string, status: VisitTask['status']) => void;
  onPriorityChange: (taskId: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onRecordOutcome: (taskId: string) => void;
}

const VisitTasksTable = ({ 
  tasks, 
  onStatusChange, 
  onPriorityChange, 
  onRecordOutcome 
}: VisitTasksTableProps) => {
  const [sortField, setSortField] = useState<string>('visit_sequence');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getStatusIcon = (status: VisitTask['status']) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'VISITED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'RESCHEDULED':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: VisitTask['status']) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'VISITED':
        return 'bg-green-100 text-green-800';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadStatusColor = (status?: string) => {
    switch (status) {
      case 'CONTACT_STAGE': return 'bg-purple-100 text-purple-800';
      case 'MEETING_STAGE': return 'bg-amber-100 text-amber-800';
      case 'PRESENTATION_NEGOTIATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED_WON': return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'LOW':
        return <ArrowDown className="h-4 w-4 text-gray-600" />;
      default:
        return <Minus className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'restaurant_name':
        aValue = a.restaurant?.name || '';
        bValue = b.restaurant?.name || '';
        break;
      case 'township':
        aValue = a.restaurant?.township || '';
        bValue = b.restaurant?.township || '';
        break;
      case 'visit_sequence':
        aValue = a.visit_sequence || 0;
        bValue = b.visit_sequence || 0;
        break;
      case 'priority_level':
        const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        aValue = priorityOrder[a.priority_level as keyof typeof priorityOrder] || 2;
        bValue = priorityOrder[b.priority_level as keyof typeof priorityOrder] || 2;
        break;
      default:
        aValue = a.visit_sequence || 0;
        bValue = b.visit_sequence || 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visit Schedule ({tasks.length} visits)</span>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Rescheduled</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Canceled</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('visit_sequence')}
                >
                  #
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('restaurant_name')}
                >
                  Restaurant
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('township')}
                >
                  Location
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lead Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('priority_level')}
                >
                  Priority
                </TableHead>
                <TableHead>Visit Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task, index) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {task.visit_sequence || index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.restaurant?.name}</div>
                      {task.restaurant?.address && (
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {task.restaurant.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.restaurant?.township && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {task.restaurant.township}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {task.restaurant?.contact_person && (
                        <div className="flex items-center text-sm">
                          <User className="h-3 w-3 mr-1" />
                          {task.restaurant.contact_person}
                        </div>
                      )}
                      {task.restaurant?.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {task.restaurant.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.lead_status ? (
                      <Badge className={getLeadStatusColor(task.lead_status)}>
                        {task.lead_status.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Lead</Badge>
                    )}
                    {task.next_action_date && (
                      <div className="flex items-center text-xs text-amber-600 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.next_action_date), 'MMM dd')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.priority_level || 'MEDIUM'}
                      onValueChange={(value: 'HIGH' | 'MEDIUM' | 'LOW') => 
                        onPriorityChange(task.id, value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(task.priority_level)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">
                          <div className="flex items-center space-x-2">
                            <ArrowUp className="h-4 w-4 text-red-600" />
                            <span>High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center space-x-2">
                            <Minus className="h-4 w-4 text-blue-600" />
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="LOW">
                          <div className="flex items-center space-x-2">
                            <ArrowDown className="h-4 w-4 text-gray-600" />
                            <span>Low</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {task.visit_time ? (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(task.visit_time), 'h:mm a')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                    {task.estimated_duration_minutes && (
                      <div className="text-xs text-muted-foreground">
                        ~{task.estimated_duration_minutes}min
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value: VisitTask['status']) => 
                        onStatusChange(task.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="VISITED">Visited</SelectItem>
                        <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                        <SelectItem value="CANCELED">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Visit Comments - {task.restaurant?.name}</DialogTitle>
                          </DialogHeader>
                          <VisitCommentsSection visitTaskId={task.id} />
                        </DialogContent>
                      </Dialog>
                      
                      {task.status === 'VISITED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onRecordOutcome(task.id)}
                        >
                          Record Outcome
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitTasksTable;
