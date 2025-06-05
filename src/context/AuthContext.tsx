import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { toast } from '@/components/ui/use-toast';
import { Session, User as SupabaseUser, AuthResponse } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("=== AuthProvider: Setting up auth state listener ===");
    setIsLoading(true);
    
    // First set up auth state change listener to ensure we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('=== Auth state changed ===');
        console.log('Event:', event);
        console.log('Session user ID:', session?.user?.id);
        console.log('Session expires at:', session?.expires_at);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to defer the profile fetch to avoid potential deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user!.id);
          }, 0);
        } else {
          console.log('No session, clearing profile');
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Then check the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== Initial session check ===');
      console.log('Initial session user ID:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('=== AuthProvider: Cleaning up auth listener ===');
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
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
        setProfile(null);
      } else {
        console.log('=== User profile fetched successfully ===');
        console.log('Profile data:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('=== Error in fetchUserProfile ===');
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshProfile() {
    if (user?.id) {
      console.log('=== Refreshing profile manually ===');
      await fetchUserProfile(user.id);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
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
    } finally {
      // Set isLoading to false here in case of error to prevent UI lock
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  async function resetPassword(email: string) {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePassword(password: string) {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
