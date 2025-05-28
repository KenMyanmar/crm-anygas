
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle, Trash2, UserPlus, Shield } from 'lucide-react';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

interface ConflictInfo {
  hasAuthUser: boolean;
  hasProfile: boolean;
  authUserId?: string;
  authUserEmail?: string;
  profileData?: any;
  conflictType: 'COMPLETE_DUPLICATE' | 'ORPHANED_PROFILE' | 'MISSING_PROFILE' | 'NONE';
}

// Service Role Key for direct admin operations
const SUPABASE_URL = 'https://fblcilccdjicyosmuome.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk3NzMzMywiZXhwIjoyMDYyNTUzMzMzfQ.CaTkwECtJrGNvSFcM00Y8WZvDvqHNw6CsdJF2LB3qM8';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const AddUserModal = ({ open, onOpenChange, onUserCreated }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'salesperson' as UserRole,
    password: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const { toast } = useToast();

  const generateRandomPassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const generatePassword = () => {
    const password = generateRandomPassword();
    setFormData(prev => ({ ...prev, password }));
  };

  // Enhanced detection function with case-insensitive email search
  const detectUserConflicts = async (email: string): Promise<ConflictInfo> => {
    console.log('=== DETECTING USER CONFLICTS ===');
    console.log('Email (case-insensitive):', email.toLowerCase());

    try {
      // Check auth users with case-insensitive search
      const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error checking auth users:', authError);
        throw new Error(`Failed to check auth users: ${authError.message}`);
      }

      const existingAuthUser = authUsers.users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      // Check profiles with case-insensitive search
      const { data: profileData, error: profileError } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        throw new Error(`Failed to check profile: ${profileError.message}`);
      }

      // Determine conflict type
      let conflictType: ConflictInfo['conflictType'] = 'NONE';
      
      if (existingAuthUser && profileData) {
        conflictType = 'COMPLETE_DUPLICATE';
      } else if (!existingAuthUser && profileData) {
        conflictType = 'ORPHANED_PROFILE';
      } else if (existingAuthUser && !profileData) {
        conflictType = 'MISSING_PROFILE';
      }

      const result: ConflictInfo = {
        hasAuthUser: !!existingAuthUser,
        hasProfile: !!profileData,
        authUserId: existingAuthUser?.id,
        authUserEmail: existingAuthUser?.email,
        profileData: profileData,
        conflictType
      };

      console.log('Conflict detection result:', result);
      return result;

    } catch (error: any) {
      console.error('Error in detectUserConflicts:', error);
      throw error;
    }
  };

  // Nuclear option - completely remove all traces of a user
  const forceDeleteUser = async (email: string): Promise<void> => {
    console.log('=== FORCE DELETING USER ===');
    console.log('Email:', email);

    try {
      // Get auth user first
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const authUser = authUsers.users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );

      // Delete profile first
      const { error: profileDeleteError } = await adminClient
        .from('users')
        .delete()
        .ilike('email', email);

      if (profileDeleteError) {
        console.log('Profile deletion note:', profileDeleteError.message);
        // Continue anyway as profile might not exist
      } else {
        console.log('Profile deleted successfully');
      }

      // Delete auth user if exists
      if (authUser) {
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUser.id);
        
        if (authDeleteError) {
          console.error('Auth user deletion error:', authDeleteError);
          throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
        }
        
        console.log('Auth user deleted successfully');
      }

      // Wait for deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('=== FORCE DELETE COMPLETED ===');
      
    } catch (error: any) {
      console.error('Error in forceDeleteUser:', error);
      throw error;
    }
  };

  // Atomic user creation with rollback
  const createUserAtomic = async (): Promise<boolean> => {
    const userPassword = formData.password || generateRandomPassword();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFullName = formData.full_name.trim();

    console.log('=== ATOMIC USER CREATION START ===');

    try {
      // Step 1: Create auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          full_name: cleanFullName,
          role: formData.role
        }
      });

      if (authError) {
        console.error('Auth user creation failed:', authError);
        throw new Error(`Auth creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Auth user creation returned no data');
      }

      console.log('Auth user created:', authData.user.id);

      // Step 2: Create profile with rollback on failure
      console.log('Creating user profile...');
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: cleanEmail,
          full_name: cleanFullName,
          role: formData.role,
          is_active: true,
          must_reset_pw: true
        });

      if (profileError) {
        console.error('Profile creation failed, rolling back auth user...');
        
        // Rollback: Delete the auth user
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id);
          console.log('Auth user rolled back successfully');
        } catch (rollbackError) {
          console.error('CRITICAL: Failed to rollback auth user:', rollbackError);
        }
        
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('=== ATOMIC USER CREATION SUCCESSFUL ===');

      // Set credentials for display
      setCreatedCredentials({
        email: cleanEmail,
        password: userPassword,
      });

      toast({
        description: `User ${formData.full_name} created successfully`,
      });

      onUserCreated();
      return true;

    } catch (error: any) {
      console.error('=== ATOMIC USER CREATION FAILED ===');
      console.error('Error:', error);
      
      toast({
        title: "Failed to create user",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Restore user by creating missing profile
  const restoreUserProfile = async (): Promise<boolean> => {
    if (!conflictInfo?.authUserId) {
      throw new Error('Auth user ID not found');
    }

    console.log('=== RESTORING USER PROFILE ===');

    try {
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: conflictInfo.authUserId,
          email: formData.email.trim().toLowerCase(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          is_active: true,
          must_reset_pw: true
        });

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('Profile restored successfully');
      
      toast({
        description: `User profile restored for ${formData.full_name}`,
      });

      onUserCreated();
      return true;

    } catch (error: any) {
      console.error('Error restoring user profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.full_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Detect any conflicts
      const conflicts = await detectUserConflicts(formData.email);
      setConflictInfo(conflicts);

      if (conflicts.conflictType === 'NONE') {
        // No conflicts, proceed with creation
        await createUserAtomic();
      } else {
        // Show conflict resolution dialog
        setShowConflictDialog(true);
      }

    } catch (error: any) {
      console.error('Error during user creation process:', error);
      toast({
        title: "Process failed",
        description: error.message || 'Failed to process user creation',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle force cleanup and create
  const handleForceCleanupAndCreate = async () => {
    setShowConflictDialog(false);
    setIsProcessing(true);

    try {
      await forceDeleteUser(formData.email);
      const success = await createUserAtomic();
      if (!success) {
        toast({
          title: "Creation failed after cleanup",
          description: "User was cleaned up but recreation failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Force cleanup failed",
        description: error.message || 'Failed to cleanup and recreate user',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle restore missing profile
  const handleRestoreProfile = async () => {
    setShowConflictDialog(false);
    setIsProcessing(true);

    try {
      await restoreUserProfile();
    } catch (error: any) {
      toast({
        title: "Profile restoration failed",
        description: error.message || 'Failed to restore user profile',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
    setConflictInfo(null);
    setShowConflictDialog(false);
    setShowPassword(false);
    onOpenChange(false);
  };

  // Conflict resolution dialog
  if (showConflictDialog && conflictInfo) {
    const getConflictDescription = () => {
      switch (conflictInfo.conflictType) {
        case 'COMPLETE_DUPLICATE':
          return 'A complete user account already exists for this email address.';
        case 'ORPHANED_PROFILE':
          return 'A user profile exists but the authentication account is missing.';
        case 'MISSING_PROFILE':
          return 'An authentication account exists but the user profile is missing.';
        default:
          return 'An unexpected conflict was detected.';
      }
    };

    const getConflictIcon = () => {
      switch (conflictInfo.conflictType) {
        case 'COMPLETE_DUPLICATE':
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'ORPHANED_PROFILE':
          return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'MISSING_PROFILE':
          return <AlertTriangle className="w-5 h-5 text-blue-500" />;
        default:
          return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getConflictIcon()}
              User Conflict Detected
            </DialogTitle>
            <DialogDescription>
              {getConflictDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-md border">
              <h4 className="font-medium mb-2">Conflict Details:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Auth User:</strong> {conflictInfo.hasAuthUser ? 'Exists' : 'Missing'}</p>
                <p><strong>Profile:</strong> {conflictInfo.hasProfile ? 'Exists' : 'Missing'}</p>
                {conflictInfo.profileData && (
                  <>
                    <p><strong>Existing Name:</strong> {conflictInfo.profileData.full_name}</p>
                    <p><strong>Existing Role:</strong> {conflictInfo.profileData.role}</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Resolution Options:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Force Cleanup & Create:</strong> Completely remove all existing data and create a fresh user</li>
                {conflictInfo.conflictType === 'MISSING_PROFILE' && (
                  <li><strong>Restore Profile:</strong> Create the missing profile for the existing auth account</li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            
            {conflictInfo.conflictType === 'MISSING_PROFILE' && (
              <Button 
                onClick={handleRestoreProfile}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Restore Profile
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              onClick={handleForceCleanupAndCreate}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Force Cleanup & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Success dialog for created credentials
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

  // Main create user dialog
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with comprehensive conflict detection and resolution.
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
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
