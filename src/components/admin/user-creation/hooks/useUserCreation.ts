
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { UserFormData, CreatedCredentials } from '../../types/userTypes';

export const useUserCreation = (onUserCreated: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const { toast } = useToast();

  const createUserViaEdgeFunction = async (formData: UserFormData): Promise<boolean> => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFullName = formData.full_name.trim();

    console.log('=== SIMPLIFIED USER CREATION ===');
    console.log('Email:', cleanEmail);
    console.log('Full Name:', cleanFullName);
    console.log('Role:', formData.role);

    try {
      // Call the Edge Function directly - no complex cleanup
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: cleanEmail,
          full_name: cleanFullName,
          role: formData.role,
          password: formData.password || undefined
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`User creation failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Edge function returned error:', data);
        throw new Error(data?.error || 'User creation failed');
      }

      console.log('User created successfully via Edge Function');

      // Set credentials for display
      if (data.credentials) {
        setCreatedCredentials({
          email: data.credentials.email,
          password: data.credentials.password,
        });
      }

      toast({
        description: `User ${cleanFullName} created successfully`,
      });

      onUserCreated();
      return true;

    } catch (error: any) {
      console.error('User creation failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Failed to create user';
      
      if (errorMessage.includes('already exists')) {
        errorMessage = 'A user with this email already exists. Please use a different email address.';
      } else if (errorMessage.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.includes('Server configuration error')) {
        errorMessage = 'Server configuration issue. Please contact an administrator.';
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

    // Prevent multiple submissions
    if (isProcessing) {
      console.log('User creation already in progress, ignoring duplicate submission');
      return;
    }

    setIsProcessing(true);

    try {
      await createUserViaEdgeFunction(formData);
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
