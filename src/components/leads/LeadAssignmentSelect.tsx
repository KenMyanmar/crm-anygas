
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
  const { users, isLoading, error } = useUsers();

  console.log('LeadAssignmentSelect - users data:', { users, isLoading, error });

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

  // Show error state if there's an error fetching users
  if (error) {
    console.error('Error in useUsers:', error);
  }

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
            {isLoading ? (
              <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                Loading users...
              </div>
            ) : error ? (
              <div className="flex h-10 w-full items-center justify-center rounded-md border border-destructive bg-background px-3 py-2 text-sm text-destructive">
                Error loading users: {error}
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                No active users found
              </div>
            ) : (
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
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating || isLoading || error !== null || users.length === 0}
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
