
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';
import { CreatedCredentials } from '../types/userTypes';

interface UserCredentialsDialogProps {
  open: boolean;
  credentials: CreatedCredentials | null;
  onClose: () => void;
}

const UserCredentialsDialog = ({ open, credentials, onClose }: UserCredentialsDialogProps) => {
  const { toast } = useToast();

  const copyCredentials = async () => {
    if (!credentials) return;
    
    const credentialsText = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    
    try {
      await navigator.clipboard.writeText(credentialsText);
      toast({
        description: "Credentials copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Please copy the credentials manually",
        variant: "destructive",
      });
    }
  };

  if (!credentials) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Created Successfully</DialogTitle>
          <DialogDescription>
            Copy these credentials and share them securely with the new user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm">
              {credentials.email}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm">
              {credentials.password}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            The user can change their password and email in their profile settings.
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button onClick={copyCredentials} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy Credentials
          </Button>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCredentialsDialog;
