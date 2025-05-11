
import { LeadStatus } from '@/types';
import StatCard from './StatCard';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
    case 'NEEDS_FOLLOW_UP':
      return <AlertTriangle className="h-4 w-4" />;
    case 'WON':
      return <CheckCircle className="h-4 w-4" />;
    case 'TRIAL':
    case 'NEGOTIATION':
      return <Clock className="h-4 w-4" />;
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

const LeadSummary = ({ statusCounts }: LeadSummaryProps) => {
  // Filter to include only the most important statuses
  const priorityStatuses: LeadStatus[] = ['NEW', 'NEEDS_FOLLOW_UP', 'TRIAL', 'NEGOTIATION', 'WON'];
  
  const filteredCounts = statusCounts.filter(item => 
    priorityStatuses.includes(item.status)
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {filteredCounts.map(item => (
        <StatCard
          key={item.status}
          title={getDisplayName(item.status)}
          value={item.count}
          icon={getIconForStatus(item.status)}
        />
      ))}
    </div>
  );
};

export default LeadSummary;
