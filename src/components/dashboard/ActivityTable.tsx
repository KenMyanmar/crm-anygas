
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Activity, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';

interface ActivityItem {
  id: string;
  user_id?: string;
  target_id?: string;
  target_type?: string;
  activity_message: string;
  created_at: string;
}

interface ActivityTableProps {
  activities: ActivityItem[];
  showFilters?: boolean;
}

const getActivityIcon = (type?: string) => {
  switch(type) {
    case 'LEAD':
      return <span className="bg-blue-100 text-blue-600 p-1 rounded text-xs">Lead</span>;
    case 'CALL_LOG':
      return <span className="bg-green-100 text-green-600 p-1 rounded text-xs">Call</span>;
    case 'ORDER':
      return <span className="bg-amber-100 text-amber-600 p-1 rounded text-xs">Order</span>;
    default:
      return <span className="bg-gray-100 text-gray-600 p-1 rounded text-xs">Other</span>;
  }
};

const ActivityTable = ({ activities, showFilters = false }: ActivityTableProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Recent Activity
        </CardTitle>
        
        {showFilters && (
          <div className="flex space-x-2">
            <div className="relative w-[180px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search activity..."
                className="pl-8"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Leads</DropdownMenuItem>
                <DropdownMenuItem>Calls</DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const date = parseISO(activity.created_at);
              const timeAgo = formatDistanceToNow(date, { addSuffix: true });
              
              return (
                <TableRow key={activity.id}>
                  <TableCell>{activity.activity_message}</TableCell>
                  <TableCell>{getActivityIcon(activity.target_type)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {timeAgo}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {activities.length > 10 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTable;
