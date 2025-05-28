
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DataInconsistency } from '../../types/consistencyTypes';
import { scanForInconsistencies } from '../../services/consistencyScanner';
import { fixInconsistency } from '../../services/inconsistencyFixer';

export const useDataConsistency = () => {
  const [inconsistencies, setInconsistencies] = useState<DataInconsistency[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const performScan = async () => {
    setIsScanning(true);

    try {
      const found = await scanForInconsistencies();
      setInconsistencies(found);
      setLastScanTime(new Date());

      if (found.length === 0) {
        toast({
          description: "No data inconsistencies found. System is healthy!",
        });
      } else {
        const criticalCount = found.filter(i => i.severity === 'critical').length;
        toast({
          title: "Data inconsistencies detected",
          description: `Found ${found.length} issue(s) including ${criticalCount} critical problem(s)`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error scanning for inconsistencies:', error);
      toast({
        title: "Scan failed",
        description: error.message || 'Failed to scan for inconsistencies',
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fixSingleInconsistency = async (inconsistency: DataInconsistency) => {
    try {
      await fixInconsistency(inconsistency);

      // Remove from inconsistencies list
      setInconsistencies(prev => prev.filter(item => 
        !(item.email === inconsistency.email && item.type === inconsistency.type)
      ));

      toast({
        description: `Fixed ${inconsistency.type.toLowerCase().replace('_', ' ')} for ${inconsistency.email}`,
      });
    } catch (error: any) {
      console.error('Error fixing inconsistency:', error);
      toast({
        title: "Fix failed",
        description: error.message || 'Failed to fix inconsistency',
        variant: "destructive",
      });
    }
  };

  const fixAllInconsistencies = async () => {
    setIsFixing(true);
    
    try {
      // Sort by severity (critical first)
      const sortedInconsistencies = [...inconsistencies].sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      for (const inconsistency of sortedInconsistencies) {
        await fixSingleInconsistency(inconsistency);
        // Small delay between fixes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        description: "All inconsistencies have been resolved",
      });
    } catch (error: any) {
      toast({
        title: "Bulk fix failed",
        description: "Some inconsistencies could not be resolved",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return {
    inconsistencies,
    isScanning,
    isFixing,
    lastScanTime,
    performScan,
    fixSingleInconsistency,
    fixAllInconsistencies
  };
};
