
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

    console.log('=== ENHANCED ATOMIC USER CREATION ===');
    console.log('Email:', cleanEmail);

    try {
      // STEP 1: Enhanced pre-flight cleanup - ensure no conflicts exist
      console.log('Running enhanced pre-flight cleanup...');
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

      // STEP 3: Add delay to ensure auth user is fully created
      console.log('Waiting for auth user creation to propagate...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // STEP 4: Double-check that no profile exists with this UUID before creating
      console.log('Checking for existing profile with UUID...');
      const { data: existingProfile } = await adminClient
        .from('users')
        .select('id')
        .eq('id', authData.user.id);

      if (existingProfile && existingProfile.length > 0) {
        console.error('Profile already exists with this UUID:', authData.user.id);
        // Clean up the auth user we just created
        await adminClient.auth.admin.deleteUser(authData.user.id);
        throw new Error('UUID conflict detected - profile already exists with this ID');
      }

      // STEP 5: Create profile (with enhanced error handling)
      console.log('Creating user profile...');
      const { error: profileError, data: profileData } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: cleanEmail,
          full_name: cleanFullName,
          role: formData.role,
          is_active: true,
          must_reset_pw: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        console.error('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // ENHANCED ROLLBACK - clean up auth user
        console.log('Rolling back auth user...');
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id);
          console.log('Auth user rollback successful');
        } catch (rollbackError) {
          console.error('CRITICAL: Auth user rollback failed:', rollbackError);
        }
        
        // Provide more specific error messages
        if (profileError.code === '23505') {
          throw new Error('User with this email or ID already exists. Please try again.');
        }
        
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Profile creation succeeded but returned no data');
      }

      console.log('Profile created successfully:', profileData);
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
      console.error('Enhanced atomic user creation failed:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = error.message || 'Failed to create user';
      
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A user with this email or ID already exists. Please try a different email.';
      } else if (error.message.includes('UUID conflict')) {
        errorMessage = 'System conflict detected. Please try again in a moment.';
      } else if (error.message.includes('Auth creation failed')) {
        errorMessage = 'Failed to create user account. Please check the email format and try again.';
      }
      
      toast({
        title: "User creation failed",
        description: errorMessage,
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
