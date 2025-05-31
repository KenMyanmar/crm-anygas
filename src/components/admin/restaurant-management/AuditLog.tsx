
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/supabase';
import { getAuditLogs } from '@/utils/auditUtils';

interface AuditEntry {
  id: string;
  action: string;
  table_name?: string;
  record_count?: number;
  details?: any;
  created_at: string;
}

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const auditLogs = await getAuditLogs();
      setLogs(auditLogs);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'import':
      case 'csv_import':
        return 'default';
      case 'delete_duplicates':
        return 'secondary';
      case 'delete_all':
      case 'bulk_delete':
        return 'destructive';
      case 'backup_created':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Restaurant Management Audit Log
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Track all restaurant management operations
          </p>
          <Button onClick={fetchLogs} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? 'Loading audit logs...' : 'No audit logs found'}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionColor(log.action)}>
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {log.table_name && (
                      <span className="text-sm text-muted-foreground">
                        → {log.table_name}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {log.record_count !== null && (
                    <div>
                      <strong>Records Affected:</strong> {log.record_count}
                    </div>
                  )}
                  
                  {log.details && (
                    <div className="col-span-2">
                      <strong>Details:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
