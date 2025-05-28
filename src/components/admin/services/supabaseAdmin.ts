
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fblcilccdjicyosmuome.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk3NzMzMywiZXhwIjoyMDYyNTUzMzMzfQ.CaTkwECtJrGNvSFcM00Y8WZvDvqHNw6CsdJF2LB3qM8';

export const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
