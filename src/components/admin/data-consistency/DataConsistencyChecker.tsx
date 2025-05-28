
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataConsistency } from './hooks/useDataConsistency';
import ScanControls from './ScanControls';
import EmergencyCleanupPanel from './EmergencyCleanupPanel';
import InconsistencyList from './InconsistencyList';

const DataConsistencyChecker = () => {
  const {
    inconsistencies,
    isScanning,
    isFixing,
    lastScanTime,
    performScan,
    fixSingleInconsistency,
    fixAllInconsistencies
  } = useDataConsistency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Enhanced Data Consistency Checker
        </CardTitle>
        <CardDescription>
          Comprehensive scan for data inconsistencies including UUID collisions, orphaned records, and email mismatches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScanControls
          onScan={performScan}
          onFixAll={fixAllInconsistencies}
          isScanning={isScanning}
          isFixing={isFixing}
          hasIssues={inconsistencies.length > 0}
        />

        <EmergencyCleanupPanel />

        {lastScanTime && (
          <div className="text-sm text-muted-foreground">
            Last scan: {lastScanTime.toLocaleString()}
          </div>
        )}

        {inconsistencies.length === 0 && lastScanTime && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No data inconsistencies found. System is healthy!
            </AlertDescription>
          </Alert>
        )}

        <InconsistencyList
          inconsistencies={inconsistencies}
          onFixInconsistency={fixSingleInconsistency}
        />
      </CardContent>
    </Card>
  );
};

export default DataConsistencyChecker;
