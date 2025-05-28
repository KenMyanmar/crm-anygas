
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield } from 'lucide-react';

interface ScanControlsProps {
  onScan: () => void;
  onFixAll: () => void;
  isScanning: boolean;
  isFixing: boolean;
  hasIssues: boolean;
}

const ScanControls = ({ onScan, onFixAll, isScanning, isFixing, hasIssues }: ScanControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onScan} 
        disabled={isScanning}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
        {isScanning ? 'Scanning...' : 'Enhanced Scan'}
      </Button>
      
      {hasIssues && (
        <Button 
          variant="destructive"
          onClick={onFixAll} 
          disabled={isFixing}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          {isFixing ? 'Fixing...' : 'Fix All Issues'}
        </Button>
      )}
    </div>
  );
};

export default ScanControls;
