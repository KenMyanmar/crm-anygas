import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle, Trash2, UserPlus } from 'lucide-react';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

interface ExistingUserInfo {
  hasAuthUser: boolean;
  hasProfile: boolean;
  profileData?: any;
  authUserId?: string;
  authUserEmail?: string;
  authUserMetadata?: any;
}

// Service Role Key for direct admin operations
// WARNING: This is exposed in the frontend and should only be used by trusted administrators
const SUPABASE_URL = 'https://fblcilccdjicyosmuome.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk3NzMzMywiZXhwIjoyMDYyNTUzMzMzfQ.CaTkwECtJrGNvSFcM00Y8WZvDvqHNw6CsdJF2LB3qM8';

// Create admin client for user management
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
  const [isCreating, setIsCreating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [existingUserInfo, setExistingUserInfo] = useState<ExistingUserInfo | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const generateRandomPassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const checkExistingUser = async (email: string): Promise<ExistingUserInfo> => {
    console.log('=== CHECKING EXISTING USER ===');
    console.log('Email:', email);

    try {
      // Check if auth user exists
      const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error checking auth users:', authError);
        throw new Error(`Failed to check existing auth users: ${authError.message}`);
      }

      const existingAuthUser = authUsers.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
      
      // Check if profile exists in users table
      const { data: profileData, error: profileError } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        throw new Error(`Failed to check existing profile: ${profileError.message}`);
      }

      const result: ExistingUserInfo = {
        hasAuthUser: !!existingAuthUser,
        hasProfile: !!profileData,
        profileData: profileData,
        authUserId: existingAuthUser?.id,
        authUserEmail: existingAuthUser?.email,
        authUserMetadata: existingAuthUser?.user_metadata
      };

      console.log('Existing user check result:', result);
      return result;

    } catch (error: any) {
      console.error('Error in checkExistingUser:', error);
      throw error;
    }
  };

  const cleanupOrphanedProfile = async (email: string) => {
    console.log('=== CLEANING UP ORPHANED PROFILE ===');
    console.log('Email:', email);

    try {
      const { error } = await adminClient
        .from('users')
        .delete()
        .ilike('email', email);

      if (error) {
        console.error('Error cleaning up orphaned profile:', error);
        throw new Error(`Failed to cleanup orphaned profile: ${error.message}`);
      }

      console.log('Orphaned profile cleaned up successfully');
      
      toast({
        description: "Orphaned profile cleaned up successfully",
      });

    } catch (error: any) {
      console.error('Error in cleanupOrphanedProfile:', error);
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createMissingProfile = async (authUserId: string, email: string, fullName: string, role: UserRole): Promise<boolean> => {
    console.log('=== CREATING MISSING PROFILE ===');
    console.log('Auth User ID:', authUserId);
    console.log('Email:', email);

    try {
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: authUserId,
          email: email.trim(),
          full_name: fullName.trim(),
          role: role,
          is_active: true,
          must_reset_pw: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create missing profile: ${profileError.message}`);
      }

      console.log('Missing profile created successfully');
      
      toast({
        description: "Missing user profile created successfully",
      });

      return true;

    } catch (error: any) {
      console.error('Error in createMissingProfile:', error);
      toast({
        title: "Profile creation failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const restoreAuthUser = async (email: string, fullName: string, role: UserRole, password: string): Promise<boolean> => {
    console.log('=== RESTORING AUTH USER ===');
    console.log('Email:', email);

    try {
      // Create auth user for existing profile
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          role: role
        }
      });

      if (authError) {
        console.error('Auth user restoration error:', authError);
        throw new Error(`Failed to restore auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Auth user restoration failed - no user data returned');
      }

      console.log('Auth user restored successfully:', authData.user.id);

      // Update the profile with the new auth user ID
      const { error: updateError } = await adminClient
        .from('users')
        .update({ 
          id: authData.user.id,
          full_name: fullName.trim(),
          role: role,
          is_active: true,
          must_reset_pw: true
        })
        .ilike('email', email);

      if (updateError) {
        console.error('Profile update error:', updateError);
        
        // Cleanup the auth user if profile update fails
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user after profile update failure:', cleanupError);
        }
        
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('=== USER RESTORATION SUCCESSFUL ===');
      return true;

    } catch (error: any) {
      console.error('=== USER RESTORATION FAILED ===');
      console.error('Error:', error);
      throw error;
    }
  };

  const createUser = async (): Promise<boolean> => {
    if (!formData.email || !formData.full_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('=== DIRECT USER CREATION START ===');
      console.log('Form data:', {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        hasPassword: !!formData.password
      });

      const userPassword = formData.password || generateRandomPassword();
      
      // Step 1: Create auth user using admin client
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: formData.email.trim(),
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name.trim(),
          role: formData.role
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        
        if (authError.message.includes('already registered')) {
          throw new Error('A user with this email already exists');
        } else if (authError.message.includes('invalid email')) {
          throw new Error('Please provide a valid email address');
        } else {
          throw new Error(`Failed to create user account: ${authError.message}`);
        }
      }

      if (!authData.user) {
        throw new Error('Auth user creation failed - no user data returned');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Step 2: Create user profile in users table
      console.log('Creating user profile...');
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          is_active: true,
          must_reset_pw: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Clean up the auth user if profile creation fails
        console.log('Cleaning up auth user due to profile creation failure...');
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id);
          console.log('Auth user cleanup successful');
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        
        if (profileError.message.includes('duplicate key')) {
          throw new Error('User profile already exists in the system');
        } else {
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
      }

      console.log('=== USER CREATION SUCCESSFUL ===');

      // Set credentials for display
      setCreatedCredentials({
        email: formData.email.trim(),
        password: userPassword,
      });

      toast({
        description: `User ${formData.full_name} created successfully`,
      });

      onUserCreated();
      return true;
      
    } catch (error: any) {
      console.error('=== USER CREATION FAILED ===');
      console.error('Error:', error);
      
      toast({
        title: "Failed to create user",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
      
      return false;
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

    setIsValidating(true);

    try {
      // First, check if user already exists
      const existingInfo = await checkExistingUser(formData.email);
      setExistingUserInfo(existingInfo);

      if (existingInfo.hasAuthUser && existingInfo.hasProfile) {
        // User completely exists - show error
        toast({
          title: "User already exists",
          description: "A user with this email already exists in the system",
          variant: "destructive",
        });
        setIsValidating(false);
        return;
      }

      if (existingInfo.hasProfile && !existingInfo.hasAuthUser) {
        // Orphaned profile - show conflict dialog for cleanup/restore
        setShowConflictDialog(true);
        setIsValidating(false);
        return;
      }

      if (existingInfo.hasAuthUser && !existingInfo.hasProfile) {
        // Auth user exists but no profile - show conflict dialog for profile creation
        setShowConflictDialog(true);
        setIsValidating(false);
        return;
      }

      // No conflicts - proceed with creation
      setIsValidating(false);
      setIsCreating(true);
      const success = await createUser();
      setIsCreating(false);

    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setIsValidating(false);
      toast({
        title: "Validation failed",
        description: error.message || 'Failed to validate user information',
        variant: "destructive",
      });
    }
  };

  const handleCleanupAndCreate = async () => {
    setShowConflictDialog(false);
    setIsCreating(true);

    try {
      await cleanupOrphanedProfile(formData.email);
      const success = await createUser();
      setIsCreating(false);
    } catch (error) {
      setIsCreating(false);
    }
  };

  const handleRestoreUser = async () => {
    setShowConflictDialog(false);
    setIsCreating(true);

    try {
      const userPassword = formData.password || generateRandomPassword();
      const success = await restoreAuthUser(formData.email, formData.full_name, formData.role, userPassword);
      
      if (success) {
        setCreatedCredentials({
          email: formData.email.trim(),
          password: userPassword,
        });
        
        toast({
          description: `User ${formData.full_name} restored successfully`,
        });
        
        onUserCreated();
      }
      
      setIsCreating(false);
    } catch (error: any) {
      setIsCreating(false);
      toast({
        title: "Failed to restore user",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  const handleCreateMissingProfile = async () => {
    setShowConflictDialog(false);
    setIsCreating(true);

    try {
      if (!existingUserInfo?.authUserId) {
        throw new Error('Auth user ID not found');
      }

      const success = await createMissingProfile(
        existingUserInfo.authUserId,
        formData.email,
        formData.full_name,
        formData.role
      );
      
      if (success) {
        toast({
          description: `User profile created for ${formData.full_name}`,
        });
        
        onUserCreated();
      }
      
      setIsCreating(false);
    } catch (error: any) {
      setIsCreating(false);
      toast({
        title: "Failed to create profile",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
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
    setExistingUserInfo(null);
    setShowConflictDialog(false);
    setShowPassword(false);
    onOpenChange(false);
  };

  // Conflict resolution dialog
  if (showConflictDialog && existingUserInfo) {
    // Handle orphaned profile case (profile exists but no auth user)
    if (existingUserInfo.hasProfile && !existingUserInfo.hasAuthUser) {
      return (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                User Data Conflict Detected
              </DialogTitle>
              <DialogDescription>
                A user profile exists for "{formData.email}" but the authentication account is missing. 
                This typically happens when data gets corrupted or partially deleted.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">Existing Profile Information:</h4>
                <div className="text-sm text-orange-700 space-y-1">
                  <p><strong>Name:</strong> {existingUserInfo.profileData?.full_name}</p>
                  <p><strong>Role:</strong> {existingUserInfo.profileData?.role}</p>
                  <p><strong>Active:</strong> {existingUserInfo.profileData?.is_active ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {existingUserInfo.profileData?.created_at ? new Date(existingUserInfo.profileData.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Choose an action:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Restore User:</strong> Create a new authentication account and link it to the existing profile</li>
                  <li><strong>Clean & Create:</strong> Delete the orphaned profile and create a completely new user</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCleanupAndCreate}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clean & Create New
              </Button>
              <Button 
                onClick={handleRestoreUser}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Restore User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    // Handle missing profile case (auth user exists but no profile)
    if (existingUserInfo.hasAuthUser && !existingUserInfo.hasProfile) {
      return (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                Missing User Profile Detected
              </DialogTitle>
              <DialogDescription>
                An authentication account exists for "{formData.email}" but the user profile is missing. 
                This can happen if user creation was interrupted or failed partially.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Existing Auth Information:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Email:</strong> {existingUserInfo.authUserEmail}</p>
                  <p><strong>Auth ID:</strong> {existingUserInfo.authUserId}</p>
                  <p><strong>Metadata:</strong> {existingUserInfo.authUserMetadata?.full_name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Choose an action:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Create Profile:</strong> Create the missing user profile and link it to the existing auth account</li>
                  <li><strong>Delete & Recreate:</strong> Delete the auth account and create a completely new user</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  setShowConflictDialog(false);
                  setIsCreating(true);
                  try {
                    if (existingUserInfo.authUserId) {
                      await adminClient.auth.admin.deleteUser(existingUserInfo.authUserId);
                      toast({
                        description: "Auth user deleted successfully",
                      });
                    }
                    const success = await createUser();
                    setIsCreating(false);
                  } catch (error) {
                    setIsCreating(false);
                    toast({
                      title: "Failed to delete and recreate user",
                      description: "An error occurred during the process",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete & Recreate
              </Button>
              <Button 
                onClick={handleCreateMissingProfile}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Missing Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
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
            Create a new user account. This creates both an authentication account and user profile.
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
            <Button type="submit" disabled={isCreating || isValidating}>
              {isValidating ? 'Validating...' : isCreating ? 'Creating User...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
