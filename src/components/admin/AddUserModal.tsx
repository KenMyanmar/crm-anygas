
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
  conflictType: 'COMPLETE_DUPLICATE' | 'ORPHANED_PROFILE' | 'ORPHANED_AUTH' | 'UUID_COLLISION' | 'NONE';
  description: string;
}

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

  // Comprehensive conflict detection with UUID collision prevention
  const detectAllConflicts = async (email: string): Promise<ConflictInfo> => {
    console.log('=== COMPREHENSIVE CONFLICT DETECTION ===');
    console.log('Email (case-insensitive):', email.toLowerCase());

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Get all auth users
      const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Failed to check auth users: ${authError.message}`);
      }

      // Find auth user by email (case-insensitive)
      const existingAuthUser = authUsers.users.find(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      // Get all profiles that match the email (case-insensitive)
      const { data: emailProfiles, error: emailProfileError } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      if (emailProfileError) {
        console.error('Error checking profiles by email:', emailProfileError);
        throw new Error(`Failed to check profiles by email: ${emailProfileError.message}`);
      }

      // If we have an auth user, also check for profiles with that UUID
      let uuidProfile = null;
      if (existingAuthUser) {
        const { data: uuidProfileData, error: uuidProfileError } = await adminClient
          .from('users')
          .select('*')
          .eq('id', existingAuthUser.id)
          .maybeSingle();

        if (uuidProfileError && uuidProfileError.code !== 'PGRST116') {
          console.error('Error checking profile by UUID:', uuidProfileError);
          throw new Error(`Failed to check profile by UUID: ${uuidProfileError.message}`);
        }

        uuidProfile = uuidProfileData;
      }

      console.log('Detection results:', {
        authUser: !!existingAuthUser,
        emailProfiles: emailProfiles?.length || 0,
        uuidProfile: !!uuidProfile
      });

      // Determine conflict type and description
      let conflictType: ConflictInfo['conflictType'] = 'NONE';
      let description = '';

      if (existingAuthUser && uuidProfile && emailProfiles && emailProfiles.length > 0) {
        conflictType = 'COMPLETE_DUPLICATE';
        description = 'Both auth user and profile exist with matching email and UUID';
      } else if (existingAuthUser && !uuidProfile && emailProfiles && emailProfiles.length > 0) {
        conflictType = 'UUID_COLLISION';
        description = 'Auth user exists, but profile with different UUID has same email';
      } else if (existingAuthUser && uuidProfile && (!emailProfiles || emailProfiles.length === 0)) {
        conflictType = 'ORPHANED_AUTH';
        description = 'Auth user and UUID-matched profile exist, but email doesn\'t match';
      } else if (existingAuthUser && !uuidProfile) {
        conflictType = 'ORPHANED_AUTH';
        description = 'Auth user exists but no corresponding profile found';
      } else if (!existingAuthUser && emailProfiles && emailProfiles.length > 0) {
        conflictType = 'ORPHANED_PROFILE';
        description = 'Profile exists but no corresponding auth user found';
      }

      const result: ConflictInfo = {
        hasAuthUser: !!existingAuthUser,
        hasProfile: !!(uuidProfile || (emailProfiles && emailProfiles.length > 0)),
        authUserId: existingAuthUser?.id,
        authUserEmail: existingAuthUser?.email,
        profileData: uuidProfile || emailProfiles?.[0],
        conflictType,
        description
      };

      console.log('Final conflict info:', result);
      return result;

    } catch (error: any) {
      console.error('Error in detectAllConflicts:', error);
      throw error;
    }
  };

  // Nuclear cleanup - removes ALL traces of a user by email
  const nuclearCleanup = async (email: string): Promise<void> => {
    console.log('=== NUCLEAR CLEANUP INITIATED ===');
    console.log('Target email:', email);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Step 1: Get all auth users with this email
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const matchingAuthUsers = authUsers.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      // Step 2: Delete all profiles with this email (case-insensitive)
      console.log('Deleting all profiles with email:', cleanEmail);
      const { error: profileDeleteError } = await adminClient
        .from('users')
        .delete()
        .ilike('email', cleanEmail);

      if (profileDeleteError) {
        console.log('Profile deletion note:', profileDeleteError.message);
      } else {
        console.log('Successfully deleted profiles by email');
      }

      // Step 3: Delete all auth users with this email
      for (const authUser of matchingAuthUsers) {
        console.log('Deleting auth user:', authUser.id);
        
        // Also delete any profile with this UUID (belt and suspenders)
        const { error: uuidProfileDeleteError } = await adminClient
          .from('users')
          .delete()
          .eq('id', authUser.id);

        if (uuidProfileDeleteError) {
          console.log('UUID profile deletion note:', uuidProfileDeleteError.message);
        }

        // Delete the auth user
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUser.id);
        if (authDeleteError) {
          console.error('Auth user deletion error:', authDeleteError);
          throw new Error(`Failed to delete auth user ${authUser.id}: ${authDeleteError.message}`);
        }
      }

      // Step 4: Wait for propagation
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('=== NUCLEAR CLEANUP COMPLETED ===');
      
    } catch (error: any) {
      console.error('Error in nuclearCleanup:', error);
      throw error;
    }
  };

  // Atomic user creation with enhanced error handling
  const createUserWithRetry = async (maxRetries = 3): Promise<boolean> => {
    const userPassword = formData.password || generateRandomPassword();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFullName = formData.full_name.trim();

    console.log('=== ATOMIC USER CREATION WITH RETRY ===');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt}/${maxRetries}`);

      try {
        // Pre-creation verification
        console.log('Pre-creation verification...');
        const preCheck = await detectAllConflicts(cleanEmail);
        
        if (preCheck.conflictType !== 'NONE') {
          console.log('Pre-creation conflict detected:', preCheck.conflictType);
          throw new Error(`Pre-creation conflict: ${preCheck.description}`);
        }

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

        // Step 2: Verify no UUID collision before profile creation
        console.log('Checking for UUID collision...');
        const { data: existingUuidProfile } = await adminClient
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (existingUuidProfile) {
          console.error('UUID collision detected! Cleaning up...');
          
          // Delete the auth user we just created
          await adminClient.auth.admin.deleteUser(authData.user.id);
          
          // Delete the conflicting profile
          await adminClient
            .from('users')
            .delete()
            .eq('id', authData.user.id);
          
          throw new Error('UUID collision detected and cleaned up. Retrying...');
        }

        // Step 3: Create profile
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
          console.error('Profile creation failed, rolling back...');
          
          // Enhanced rollback
          try {
            await adminClient.auth.admin.deleteUser(authData.user.id);
            
            // Also clean up any profile that might have been created
            await adminClient
              .from('users')
              .delete()
              .eq('id', authData.user.id);
              
            console.log('Rollback completed');
          } catch (rollbackError) {
            console.error('CRITICAL: Rollback failed:', rollbackError);
          }
          
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        console.log('=== USER CREATION SUCCESSFUL ===');

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
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error('=== ALL ATTEMPTS FAILED ===');
          toast({
            title: "Failed to create user",
            description: error.message || 'All retry attempts failed',
            variant: "destructive",
          });
          return false;
        }
        
        // Wait before retry
        console.log('Waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return false;
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
      // Comprehensive conflict detection
      const conflicts = await detectAllConflicts(formData.email);
      setConflictInfo(conflicts);

      if (conflicts.conflictType === 'NONE') {
        // No conflicts, proceed with creation
        await createUserWithRetry();
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

  // Handle nuclear cleanup and create
  const handleNuclearCleanupAndCreate = async () => {
    setShowConflictDialog(false);
    setIsProcessing(true);

    try {
      await nuclearCleanup(formData.email);
      const success = await createUserWithRetry();
      if (!success) {
        toast({
          title: "Creation failed after cleanup",
          description: "User was cleaned up but recreation failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Nuclear cleanup failed",
        description: error.message || 'Failed to cleanup and recreate user',
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
    const getConflictIcon = () => {
      switch (conflictInfo.conflictType) {
        case 'COMPLETE_DUPLICATE':
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'UUID_COLLISION':
          return <AlertTriangle className="w-5 h-5 text-purple-500" />;
        case 'ORPHANED_PROFILE':
          return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'ORPHANED_AUTH':
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
              Data Conflict Detected
            </DialogTitle>
            <DialogDescription>
              {conflictInfo.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-md border">
              <h4 className="font-medium mb-2">Conflict Details:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Type:</strong> {conflictInfo.conflictType.replace('_', ' ')}</p>
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
              <p><strong>Solution:</strong></p>
              <p>The <strong>Nuclear Cleanup</strong> option will completely remove all existing data for this email address (both auth user and profile records) and then create a fresh user account.</p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleNuclearCleanupAndCreate}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Nuclear Cleanup & Create'}
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
            Create a new user account with enhanced conflict detection and resolution.
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
