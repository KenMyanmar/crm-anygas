
import { supabase } from '../lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const signInUser = async (email: string, password: string) => {
  try {
    console.log('Signing in with:', email);
    const response = await supabase.auth.signInWithPassword({ email, password });
    
    if (response.error) {
      console.error('Sign in error:', response.error);
      throw response.error;
    }

    console.log('Sign in successful:', response.data.user?.id);
    
    toast({
      description: "Welcome back!",
    });

    return response;
  } catch (error: any) {
    console.error('Error signing in:', error);
    toast({
      title: "Sign In Failed",
      description: error?.message || "Failed to sign in",
      variant: "destructive",
    });
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    toast({
      description: "You have been signed out",
    });
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast({
      title: "Sign Out Failed",
      description: error?.message || "Failed to sign out",
      variant: "destructive",
    });
    throw error;
  }
};

export const resetUserPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }

    toast({
      description: "Password reset instructions have been sent to your email",
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast({
      title: "Password Reset Failed",
      description: error?.message || "Failed to send reset instructions",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateUserPassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      throw error;
    }

    toast({
      description: "Your password has been updated",
    });
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast({
      title: "Password Update Failed",
      description: error?.message || "Failed to update password",
      variant: "destructive",
    });
    throw error;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('=== Fetching user profile ===');
    console.log('User ID:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('=== Profile fetch error ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      // If the user profile doesn't exist yet, we'll create a default one
      if (error.code === 'PGRST116') {
        console.log('User profile not found - this may be expected for new users');
      } else {
        console.error('Unexpected error fetching profile:', error);
        throw error;
      }
      return null;
    } else {
      console.log('=== User profile fetched successfully ===');
      console.log('Profile data:', data);
      return data;
    }
  } catch (error) {
    console.error('=== Error in fetchUserProfile ===');
    console.error('Error:', error);
    toast({
      title: "Error",
      description: "Failed to load user profile",
      variant: "destructive",
    });
    throw error;
  }
};
