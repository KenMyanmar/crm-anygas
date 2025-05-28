import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

const AddUserModal = ({ open, onOpenChange, onUserCreated }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'salesperson' as UserRole,
    password: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const createUser = async (isRetry = false) => {
    if (!formData.email || !formData.full_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('=== FRONTEND USER CREATION START ===');
      console.log('Form data:', {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        hasPassword: !!formData.password,
        isRetry
      });

      const userPassword = formData.password || generateRandomPassword();
      
      // Call the edge function
      console.log('Calling edge function...');
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          password: userPassword,
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response data from edge function');
      }

      if (!data.success) {
        console.error('Edge function returned failure:', data);
        throw new Error(data.error || 'User creation failed');
      }

      console.log('=== USER CREATION SUCCESSFUL ===');
      console.log('User ID:', data.user?.id);
      console.log('Has credentials:', !!data.credentials);

      // Set credentials for display
      setCreatedCredentials({
        email: data.credentials.email,
        password: data.credentials.password,
      });

      toast({
        description: `User ${formData.full_name} created successfully`,
      });

      onUserCreated();
      setRetryCount(0);
      return true;
      
    } catch (error: any) {
      console.error('=== USER CREATION FAILED ===');
      console.error('Error:', error);
      
      let errorMessage = 'Failed to create user';
      
      if (error.message) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          errorMessage = 'User already exists in the system';
        } else if (error.message.includes('invalid API key')) {
          errorMessage = 'Configuration error: Invalid API key. Please contact your administrator.';
        } else if (error.message.includes('environment variables')) {
          errorMessage = 'Server configuration error. Please contact your administrator.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Failed to create user",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const generateRandomPassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    const success = await createUser();
    
    setIsCreating(false);
  };

  const handleRetry = async () => {
    setIsCreating(true);
    setRetryCount(prev => prev + 1);
    
    console.log(`=== RETRY ATTEMPT ${retryCount + 1} ===`);
    
    const success = await createUser(true);
    
    setIsCreating(false);
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    
    const credentials = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    
    try {
      await navigator.clipboard.writeText(credentials);
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

  const handleClose = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'salesperson',
      password: '',
    });
    setCreatedCredentials(null);
    setShowPassword(false);
    setRetryCount(0);
    onOpenChange(false);
  };

  if (createdCredentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
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
                {createdCredentials.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {createdCredentials.password}
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
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. If a user with this email already exists, it will be replaced.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="salesperson">Salesperson</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to auto-generate"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If left blank, a 12-character random password will be generated
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {retryCount > 0 && !isCreating && (
              <Button type="button" variant="secondary" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({retryCount})
              </Button>
            )}
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating User...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
