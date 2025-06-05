
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContextType } from '../types/auth';
import { useAuthOperations } from '../hooks/useAuthOperations';
import { fetchUserProfile } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authOperations = useAuthOperations(user, setProfile, setIsLoading);

  const handleUserProfileFetch = async (userId: string) => {
    try {
      const profileData = await fetchUserProfile(userId);
      setProfile(profileData);
    } catch (error) {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

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
            handleUserProfileFetch(session.user!.id);
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
        handleUserProfileFetch(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('=== AuthProvider: Cleaning up auth listener ===');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    isLoading,
    ...authOperations,
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
