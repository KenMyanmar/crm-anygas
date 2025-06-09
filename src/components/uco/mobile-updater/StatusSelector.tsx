
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UcoStatus } from '@/types/uco';

interface StatusSelectorProps {
  currentStatus: UcoStatus;
  onStatusSelect: (status: UcoStatus) => void;
  isUpdating: boolean;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusSelect,
  isUpdating
}) => {
  const statusOptions: Array<{ value: UcoStatus; label: string; color: string }> = [
    { value: 'have_uco', label: 'Have UCO', color: 'bg-green-100 text-green-800' },
    { value: 'no_uco_reuse_staff', label: 'NO UCO (Reuse/Staff)', color: 'bg-blue-100 text-blue-800' },
    { value: 'no_uco_not_ready', label: 'No UCO (Not Ready)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'shop_closed', label: 'Shop Closed', color: 'bg-red-100 text-red-800' },
    { value: 'not_assessed', label: 'Not Assessed', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div>
      <Label className="text-sm font-medium">Update Status</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            variant={currentStatus === status.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusSelect(status.value)}
            disabled={isUpdating}
            className="text-xs h-8"
          >
            {status.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
