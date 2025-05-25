
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const LEAD_STATUSES = [
  { value: 'CONTACT_STAGE', label: 'Contact Stage', color: 'bg-blue-100 text-blue-800' },
  { value: 'TRIAL', label: 'Trial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
  { value: 'WON', label: 'Won', color: 'bg-green-100 text-green-800' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
];

interface LeadStatusSelectProps {
  currentStatus: string;
  onStatusUpdate: (newStatus: string, notes?: string) => Promise<boolean>;
  leadName: string;
}

const LeadStatusSelect = ({ currentStatus, onStatusUpdate, leadName }: LeadStatusSelectProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatusInfo = LEAD_STATUSES.find(s => s.value === currentStatus);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    const success = await onStatusUpdate(selectedStatus, notes);
    
    if (success) {
      setIsOpen(false);
      setNotes('');
    }
    setIsUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`${currentStatusInfo?.color || ''}`}>
          {currentStatusInfo?.label || currentStatus}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Lead Status - {leadName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className={`px-2 py-1 rounded text-xs ${status.color}`}>
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadStatusSelect;
