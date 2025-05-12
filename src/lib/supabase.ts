
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://fblcilccdjicyosmuome.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzczMzMsImV4cCI6MjA2MjU1MzMzM30.X-lx6GGafug8HsMcs_C0_IVuCrC_1C_KiO0epX8a4gM';

// Initialize the Supabase client with explicit auth settings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to check if a user has admin role
export const isUserAdmin = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error checking admin status:', error);
    return false;
  }
  
  return data.role === 'admin';
};

// Helper function to get a formatted date string
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
