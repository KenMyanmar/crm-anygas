
import { LeadStatus } from '@/types';
import StatCard from './StatCard';
import { FileText, AlertCircle, CheckCircle, Clock, MessageCircle, Briefcase, PauseCircle, XCircle } from 'lucide-react';

interface LeadSummaryProps {
  statusCounts: {
    status: LeadStatus;
    count: number;
  }[];
}

const getIconForStatus = (status: LeadStatus) => {
  switch(status) {
    case 'NEW':
      return <FileText className="h-4 w-4" />;
    case 'CONTACTED':
      return <MessageCircle className="h-4 w-4" />;
    case 'NEEDS_FOLLOW_UP':
      return <AlertCircle className="h-4 w-4" />;
    case 'TRIAL':
      return <Clock className="h-4 w-4" />;
    case 'NEGOTIATION':
      return <Briefcase className="h-4 w-4" />;
    case 'WON':
      return <CheckCircle className="h-4 w-4" />;
    case 'LOST':
      return <XCircle className="h-4 w-4" />;
    case 'ON_HOLD':
      return <PauseCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getDisplayName = (status: LeadStatus): string => {
  switch(status) {
    case 'NEW':
      return 'New Leads';
    case 'CONTACTED':
      return 'Contacted';
    case 'NEEDS_FOLLOW_UP':
      return 'Need Follow-up';
    case 'TRIAL':
      return 'In Trial';
    case 'NEGOTIATION':
      return 'In Negotiation';
    case 'WON':
      return 'Won';
    case 'LOST':
      return 'Lost';
    case 'ON_HOLD':
      return 'On Hold';
    default:
      return status;
  }
};

const getStatusColor = (status: LeadStatus): string => {
  switch(status) {
    case 'NEW':
      return 'text-blue-500';
    case 'CONTACTED':
      return 'text-purple-500';
    case 'NEEDS_FOLLOW_UP':
      return 'text-amber-500';
    case 'TRIAL':
      return 'text-orange-500';
    case 'NEGOTIATION':
      return 'text-teal-500';
    case 'WON':
      return 'text-green-500';
    case 'LOST':
      return 'text-red-500';
    case 'ON_HOLD':
      return 'text-gray-500';
    default:
      return '';
  }
};

const LeadSummary = ({ statusCounts }: LeadSummaryProps) => {
  // Show all statuses but sort them in a logical flow
  const priorityOrder: { [key in LeadStatus]?: number } = {
    'NEW': 1,
    'CONTACTED': 2,
    'NEEDS_FOLLOW_UP': 3,
    'TRIAL': 4,
    'NEGOTIATION': 5,
    'WON': 6,
    'LOST': 7,
    'ON_HOLD': 8
  };
  
  const sortedCounts = [...statusCounts].sort((a, b) => {
    return (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99);
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {sortedCounts.map(item => (
        <StatCard
          key={item.status}
          title={getDisplayName(item.status)}
          value={item.count}
          icon={getIconForStatus(item.status)}
          iconColor={getStatusColor(item.status)}
        />
      ))}
    </div>
  );
};

export default LeadSummary;
