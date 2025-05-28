
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useEmergencyCleanup } from './hooks/useEmergencyCleanup';

const EmergencyCleanupPanel = () => {
  const { emergencyEmail, setEmergencyEmail, isEmergencyCleanup, handleEmergencyCleanup } = useEmergencyCleanup();

  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Emergency Manual Cleanup
      </h4>
      <p className="text-sm text-red-700 mb-3">
        Use this to forcefully remove ALL traces of a user by email when UUID collisions persist.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Enter email to cleanup"
          value={emergencyEmail}
          onChange={(e) => setEmergencyEmail(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="destructive"
          onClick={handleEmergencyCleanup}
          disabled={isEmergencyCleanup || !emergencyEmail.trim()}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {isEmergencyCleanup ? 'Cleaning...' : 'Emergency Cleanup'}
        </Button>
      </div>
    </div>
  );
};

export default EmergencyCleanupPanel;
