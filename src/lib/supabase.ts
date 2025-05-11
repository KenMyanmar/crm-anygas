
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://fblcilccdjicyosmuome.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzczMzMsImV4cCI6MjA2MjU1MzMzM30.X-lx6GGafug8HsMcs_C0_IVuCrC_1C_KiO0epX8a4gM';

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for type-safe Supabase queries will be added here
