
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { DataInconsistency } from '../types/consistencyTypes';

interface InconsistencyListProps {
  inconsistencies: DataInconsistency[];
  onFixInconsistency: (inconsistency: DataInconsistency) => void;
}

const InconsistencyList = ({ inconsistencies, onFixInconsistency }: InconsistencyListProps) => {
  const getInconsistencyBadgeVariant = (type: DataInconsistency['type'], severity: DataInconsistency['severity']) => {
    if (severity === 'critical') return 'destructive' as const;
    if (severity === 'high') return 'destructive' as const;
    if (severity === 'medium') return 'secondary' as const;
    return 'outline' as const;
  };

  const getSeverityColor = (severity: DataInconsistency['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (inconsistencies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">
        Found {inconsistencies.length} inconsistenc{inconsistencies.length === 1 ? 'y' : 'ies'}:
      </div>
      
      {inconsistencies.map((inconsistency, index) => (
        <div key={index} className="p-3 border rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getInconsistencyBadgeVariant(inconsistency.type, inconsistency.severity)}>
                {inconsistency.type.replace('_', ' ')}
              </Badge>
              <span className={`text-xs font-medium uppercase ${getSeverityColor(inconsistency.severity)}`}>
                {inconsistency.severity}
              </span>
              <span className="font-medium">{inconsistency.email}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFixInconsistency(inconsistency)}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Fix
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {inconsistency.details}
          </div>
          {inconsistency.authUserId && (
            <div className="text-xs text-muted-foreground">
              Auth ID: {inconsistency.authUserId}
            </div>
          )}
          {inconsistency.profileId && (
            <div className="text-xs text-muted-foreground">
              Profile ID: {inconsistency.profileId}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InconsistencyList;
