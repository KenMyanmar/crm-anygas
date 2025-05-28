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
    case 'CONTACT_STAGE':
      return <MessageCircle className="h-4 w-4" />;
    case 'MEETING_STAGE':
      return <Clock className="h-4 w-4" />;
    case 'PRESENTATION_NEGOTIATION':
      return <Briefcase className="h-4 w-4" />;
    case 'CLOSED_WON':
      return <CheckCircle className="h-4 w-4" />;
    case 'CLOSED_LOST':
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getDisplayName = (status: LeadStatus): string => {
  switch(status) {
    case 'CONTACT_STAGE':
      return 'Contact Stage';
    case 'MEETING_STAGE':
      return 'Meeting Stage';
    case 'PRESENTATION_NEGOTIATION':
      return 'Presentation/Negotiation';
    case 'CLOSED_WON':
      return 'Closed Won';
    case 'CLOSED_LOST':
      return 'Closed Lost';
    default:
      return status;
  }
};

const getStatusColor = (status: LeadStatus): string => {
  switch(status) {
    case 'CONTACT_STAGE':
      return 'text-purple-500';
    case 'MEETING_STAGE':
      return 'text-amber-500';
    case 'PRESENTATION_NEGOTIATION':
      return 'text-teal-500';
    case 'CLOSED_WON':
      return 'text-green-500';
    case 'CLOSED_LOST':
      return 'text-red-500';
    default:
      return '';
  }
};

const LeadSummary = ({ statusCounts }: LeadSummaryProps) => {
  // Show all statuses but sort them in a logical flow
  const priorityOrder: { [key in LeadStatus]?: number } = {
    'CONTACT_STAGE': 1,
    'MEETING_STAGE': 2,
    'PRESENTATION_NEGOTIATION': 3,
    'CLOSED_WON': 4,
    'CLOSED_LOST': 5
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
