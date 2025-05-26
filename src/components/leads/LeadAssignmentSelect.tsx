
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
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useLeads';
import { UserCheck } from 'lucide-react';

interface LeadAssignmentSelectProps {
  currentAssignedUserId: string;
  currentAssignedUserName: string;
  onAssignmentUpdate: (newUserId: string) => Promise<boolean>;
  leadName: string;
}

const LeadAssignmentSelect = ({ 
  currentAssignedUserId, 
  currentAssignedUserName, 
  onAssignmentUpdate, 
  leadName 
}: LeadAssignmentSelectProps) => {
  const [selectedUserId, setSelectedUserId] = useState(currentAssignedUserId);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { users } = useUsers();

  const handleUpdate = async () => {
    if (selectedUserId === currentAssignedUserId) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    const success = await onAssignmentUpdate(selectedUserId);
    
    if (success) {
      setIsOpen(false);
    }
    setIsUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 mr-1" />
          {currentAssignedUserName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Lead - {leadName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assignee">Assign to</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Reassign Lead'}
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

export default LeadAssignmentSelect;
