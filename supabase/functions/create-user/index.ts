
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

  console.log('=== USER CREATION EDGE FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestBody = await req.json();
    const { email, full_name, role, password } = requestBody;

    console.log('=== REQUEST DATA ===');
    console.log('Email:', email);
    console.log('Full Name:', full_name);
    console.log('Role:', role);
    console.log('Has Password:', !!password);

    // Validate required fields
    if (!email || !full_name || !role) {
      console.error('Missing required fields:', { 
        email: !!email, 
        full_name: !!full_name, 
        role: !!role 
      });
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

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error: Missing environment variables',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('=== ENVIRONMENT CHECK ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Has Service Key:', !!supabaseServiceKey);

    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate password if not provided
    const userPassword = password || generateRandomPassword();
    console.log('Password length:', userPassword.length);

    // Clean email
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = full_name.trim();

    console.log('=== CHECKING FOR EXISTING USER ===');
    
    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to check existing users: ${listError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Total users in system:', existingUsers.users.length);
    
    const existingUser = existingUsers.users.find(user => 
      user.email?.toLowerCase() === cleanEmail
    );
    
    if (existingUser) {
      console.log('=== EXISTING USER FOUND ===');
      console.log('Existing user ID:', existingUser.id);
      console.log('Existing user email:', existingUser.email);
      
      // Delete from custom users table first (if exists)
      console.log('Attempting to delete existing user profile...');
      const { error: deleteProfileError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', existingUser.id);

      if (deleteProfileError) {
        console.log('Profile deletion note:', deleteProfileError.message);
        // Continue anyway as the profile might not exist
      } else {
        console.log('Successfully deleted existing user profile');
      }

      // Delete from auth.users
      console.log('Attempting to delete existing auth user...');
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
        existingUser.id
      );
      
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to delete existing user: ${deleteAuthError.message}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      console.log('Successfully deleted existing auth user');
      
      // Wait a moment for deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('No existing user found with email:', cleanEmail);
    }

    // Create user using admin client
    console.log('=== CREATING NEW AUTH USER ===');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanFullName,
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create auth user: ${authError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!authData.user) {
      console.error('Auth user creation returned no user data');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Auth user creation returned no user data',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Insert user profile
    console.log('=== CREATING USER PROFILE ===');
    const profileData = {
      id: authData.user.id,
      email: cleanEmail,
      full_name: cleanFullName,
      role: role,
      is_active: true,
      must_reset_pw: false,
    };
    
    console.log('Profile data to insert:', profileData);
    
    const { data: profileInsertData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('=== PROFILE CREATION FAILED ===');
      console.error('Profile error:', profileError);
      
      // Don't delete the auth user - let admin handle it manually
      console.log('Auth user created but profile failed. Auth user ID:', authData.user.id);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Profile creation failed: ${profileError.message}`,
          authUserId: authData.user.id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('=== USER CREATION SUCCESSFUL ===');
    console.log('User ID:', authData.user.id);
    console.log('Profile created:', !!profileInsertData);

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        profile: profileInsertData,
        credentials: {
          email: cleanEmail,
          password: userPassword,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        type: 'unexpected_error',
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
