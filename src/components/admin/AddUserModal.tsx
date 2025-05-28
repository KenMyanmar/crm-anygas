
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle, UserPlus, Shield } from 'lucide-react';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
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

  // CRITICAL: Complete nuclear cleanup - removes ALL traces by email with verification
  const completeNuclearCleanup = async (email: string): Promise<void> => {
    console.log('=== COMPLETE NUCLEAR CLEANUP ===');
    console.log('Target email:', email);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Step 1: Get ALL auth users with this email (case-insensitive)
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const matchingAuthUsers = authUsers.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      console.log('Found auth users to delete:', matchingAuthUsers.length);

      // Step 2: Collect ALL UUIDs that might have profiles
      const uuidsToClean = new Set<string>();
      
      // Add UUIDs from auth users
      matchingAuthUsers.forEach(user => uuidsToClean.add(user.id));

      // Step 3: Find profiles by email (case-insensitive)
      const { data: emailProfiles } = await adminClient
        .from('users')
        .select('id, email')
        .ilike('email', cleanEmail);

      console.log('Found profiles by email:', emailProfiles?.length || 0);
      
      // Add UUIDs from email profiles
      emailProfiles?.forEach(profile => uuidsToClean.add(profile.id));

      console.log('Total UUIDs to clean:', uuidsToClean.size);

      // Step 4: Delete ALL profiles by UUID (multiple approaches for safety)
      for (const uuid of uuidsToClean) {
        console.log('Deleting profile by UUID:', uuid);
        
        // Try multiple delete approaches
        await adminClient.from('users').delete().eq('id', uuid);
        await adminClient.from('users').delete().ilike('email', cleanEmail);
      }

      // Step 5: Delete ALL auth users
      for (const authUser of matchingAuthUsers) {
        console.log('Deleting auth user:', authUser.id);
        const { error } = await adminClient.auth.admin.deleteUser(authUser.id);
        if (error) {
          console.error('Auth deletion error for', authUser.id, ':', error);
        }
      }

      // Step 6: VERIFICATION - ensure cleanup was complete
      console.log('=== CLEANUP VERIFICATION ===');
      
      // Wait for deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify no auth users remain
      const { data: remainingAuthUsers } = await adminClient.auth.admin.listUsers();
      const stillExistingAuth = remainingAuthUsers.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      // Verify no profiles remain
      const { data: remainingProfiles } = await adminClient
        .from('users')
        .select('id, email')
        .or(`email.ilike.${cleanEmail},${Array.from(uuidsToClean).map(uuid => `id.eq.${uuid}`).join(',')}`);

      if (stillExistingAuth.length > 0 || (remainingProfiles && remainingProfiles.length > 0)) {
        console.error('CLEANUP FAILED - REMAINING RECORDS:');
        console.error('Auth users:', stillExistingAuth.length);
        console.error('Profiles:', remainingProfiles?.length || 0);
        throw new Error(`Cleanup verification failed: ${stillExistingAuth.length} auth users and ${remainingProfiles?.length || 0} profiles still exist`);
      }

      console.log('=== CLEANUP VERIFICATION PASSED ===');

    } catch (error: any) {
      console.error('Complete nuclear cleanup failed:', error);
      throw error;
    }
  };

  // CRITICAL: Pre-flight check with aggressive cleanup
  const preFlightCleanupAndCheck = async (email: string): Promise<boolean> => {
    console.log('=== PRE-FLIGHT CLEANUP AND CHECK ===');
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Perform complete nuclear cleanup first
      await completeNuclearCleanup(cleanEmail);

      // Double-check that everything is clean
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const existingAuth = authUsers.users.find(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      const { data: existingProfiles } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      if (existingAuth || (existingProfiles && existingProfiles.length > 0)) {
        console.error('PRE-FLIGHT CHECK FAILED - RECORDS STILL EXIST');
        throw new Error('Unable to clean existing records completely');
      }

      console.log('PRE-FLIGHT CHECK PASSED - ALL CLEAN');
      return true;

    } catch (error: any) {
      console.error('Pre-flight cleanup failed:', error);
      throw error;
    }
  };

  // CRITICAL: Simplified atomic user creation - no retry loops
  const createUserAtomic = async (): Promise<boolean> => {
    const userPassword = formData.password || generateRandomPassword();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFullName = formData.full_name.trim();

    console.log('=== ATOMIC USER CREATION ===');
    console.log('Email:', cleanEmail);

    try {
      // STEP 1: Pre-flight cleanup - ensure no conflicts exist
      await preFlightCleanupAndCheck(cleanEmail);

      // STEP 2: Create auth user
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
        console.error('Auth creation failed:', authError);
        throw new Error(`Auth creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Auth user creation returned no data');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // STEP 3: Create profile (with enhanced error handling)
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
        console.error('Profile creation failed:', profileError);
        
        // ENHANCED ROLLBACK - clean up auth user
        console.log('Rolling back auth user...');
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id);
          console.log('Auth user rollback successful');
        } catch (rollbackError) {
          console.error('CRITICAL: Auth user rollback failed:', rollbackError);
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
      console.error('Atomic user creation failed:', error);
      toast({
        title: "User creation failed",
        description: error.message || 'Failed to create user',
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

    setIsProcessing(true);

    try {
      // Direct atomic creation - no conflict detection loops
      await createUserAtomic();
    } catch (error: any) {
      console.error('Error during user creation process:', error);
      toast({
        title: "User creation failed",
        description: error.message || 'Failed to create user',
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
    setShowPassword(false);
    onOpenChange(false);
  };

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
            Create a new user account with enhanced cleanup to prevent UUID collisions.
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
              {isProcessing ? 'Creating User...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
