import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Filter, Plus, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Lead {
  id: string;
  restaurant_name: string;
  next_action_description?: string;
  next_action_date?: string;
  status: LeadStatus;
}

interface LeadTableProps {
  upcomingActions: Lead[];
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

const LeadTable = ({ upcomingActions }: LeadTableProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{field: 'name' | 'status' | 'date', direction: 'asc' | 'desc'}>({
    field: 'name',
    direction: 'asc'
  });
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  let filteredLeads = [...upcomingActions];
  
  // Apply filter
  if (filter) {
    filteredLeads = filteredLeads.filter(lead => lead.status === filter);
  }
  
  // Apply search
  if (searchTerm) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (lead.next_action_description && 
       lead.next_action_description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // Apply sorting
  filteredLeads.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy.field === 'name') {
      comparison = a.restaurant_name.localeCompare(b.restaurant_name);
    } else if (sortBy.field === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy.field === 'date') {
      const dateA = a.next_action_date ? parseISO(a.next_action_date) : new Date(0);
      const dateB = b.next_action_date ? parseISO(b.next_action_date) : new Date(0);
      comparison = dateA.getTime() - dateB.getTime();
    }
    
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle sorting
  const handleSort = (field: 'name' | 'status' | 'date') => {
    if (sortBy.field === field) {
      setSortBy({
        ...sortBy,
        direction: sortBy.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortBy({
        field,
        direction: 'asc'
      });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>My Leads</CardTitle>
        <div className="flex space-x-2">
          <div className="relative w-[220px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter(null)}>
                All Statuses
              </DropdownMenuItem>
              {['CONTACT_STAGE', 'MEETING_STAGE', 'PRESENTATION_NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].map(
                (status) => (
                  <DropdownMenuItem key={status} onClick={() => setFilter(status)}>
                    {status.toLowerCase().replace(/_/g, ' ')}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Lead
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Restaurant Name
                {sortBy.field === 'name' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Next Action</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Next Action Date
                {sortBy.field === 'date' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortBy.field === 'status' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">{lead.restaurant_name}</TableCell>
                  <TableCell>{lead.next_action_description || 'No action scheduled'}</TableCell>
                  <TableCell>
                    {lead.next_action_date 
                      ? format(parseISO(lead.next_action_date), 'MMM d, yyyy')
                      : '—'
                    }
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationLink className="cursor-not-allowed">...</PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Current page */}
                <PaginationItem>
                  <PaginationLink isActive>{currentPage}</PaginationLink>
                </PaginationItem>
                
                {/* Next page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink className="cursor-not-allowed">...</PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadTable;
