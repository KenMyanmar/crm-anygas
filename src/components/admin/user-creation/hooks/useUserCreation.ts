
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { adminClient } from '../../services/supabaseAdmin';
import { generateRandomPassword } from '../../services/passwordService';
import { preFlightCleanupAndCheck } from '../../services/userCleanupService';
import { UserFormData, CreatedCredentials } from '../../types/userTypes';

export const useUserCreation = (onUserCreated: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const { toast } = useToast();

  const createUserAtomic = async (formData: UserFormData): Promise<boolean> => {
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

  const handleSubmit = async (formData: UserFormData) => {
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
      await createUserAtomic(formData);
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

  const resetState = () => {
    setCreatedCredentials(null);
  };

  return {
    isProcessing,
    createdCredentials,
    handleSubmit,
    resetState
  };
};
