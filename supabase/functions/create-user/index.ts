
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { email, full_name, role, password } = requestBody;

    console.log('=== USER CREATION REQUEST ===');
    console.log('Email:', email);
    console.log('Full Name:', full_name);
    console.log('Role:', role);
    console.log('Has Password:', !!password);

    // Validate required fields
    if (!email || !full_name || !role) {
      console.error('Missing required fields:', { email: !!email, full_name: !!full_name, role: !!role });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: email, full_name, and role are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate password if not provided
    const userPassword = password || generateRandomPassword();
    console.log('Generated/Using password length:', userPassword.length);

    // Check if user already exists in auth.users
    console.log('=== CHECKING EXISTING USER ===');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }

    const existingUser = existingUsers.users.find(user => user.email === email.trim());
    
    if (existingUser) {
      console.log('=== EXISTING USER FOUND ===');
      console.log('Existing user ID:', existingUser.id);
      
      // Delete from custom users table first (if exists)
      console.log('Deleting existing user profile...');
      const { error: deleteProfileError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', existingUser.id);

      if (deleteProfileError) {
        console.log('Note: Could not delete existing profile (may not exist):', deleteProfileError.message);
        // Continue anyway as the profile might not exist
      } else {
        console.log('Successfully deleted existing user profile');
      }

      // Delete from auth.users
      console.log('Deleting existing auth user...');
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        throw new Error(`Failed to delete existing user: ${deleteAuthError.message}`);
      }
      
      console.log('Successfully deleted existing auth user');
    } else {
      console.log('No existing user found, proceeding with creation');
    }

    // Create user using admin client
    console.log('=== CREATING NEW USER ===');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Auth user creation returned no user data');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Insert user profile - DON'T DELETE AUTH USER IF THIS FAILS
    console.log('=== CREATING USER PROFILE ===');
    const profileData = {
      id: authData.user.id,
      email: email.trim(),
      full_name: full_name.trim(),
      role: role,
      is_active: true,
      must_reset_pw: false,
    };
    
    console.log('Profile data to insert:', profileData);
    
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert(profileData);

    if (profileError) {
      console.error('=== PROFILE CREATION FAILED ===');
      console.error('Profile error details:', profileError);
      
      // Log the error but DON'T delete the auth user - let admin handle it
      console.log('Auth user was created but profile failed. Auth user ID:', authData.user.id);
      
      // Return specific error information
      throw new Error(`Profile creation failed: ${profileError.message}. Code: ${profileError.code}`);
    }

    console.log('=== USER CREATION SUCCESSFUL ===');
    console.log('User ID:', authData.user.id);
    console.log('Email:', email.trim());

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        credentials: {
          email: email.trim(),
          password: userPassword,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('=== USER CREATION FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create user',
        details: error.details || null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateRandomPassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
