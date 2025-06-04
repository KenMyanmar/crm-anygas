
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { CreateUserRequest, CreateUserResponse } from './types.ts';
import { generateRandomPassword, sanitizeInput, sanitizeName } from './utils.ts';

export class UserService {
  private supabaseAdmin: any;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  async checkUserExists(email: string): Promise<boolean> {
    console.log('=== CHECKING USER EXISTS ===');
    
    const { data: existingUsers, error: listError } = await this.supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }

    const cleanEmail = sanitizeInput(email);
    const existingUser = existingUsers.users.find((user: any) => 
      user.email?.toLowerCase() === cleanEmail
    );
    
    if (existingUser) {
      console.log('User already exists with email:', cleanEmail);
      return true;
    }
    
    return false;
  }

  async createAuthUser(email: string, fullName: string, password?: string): Promise<any> {
    console.log('=== CREATING AUTH USER ===');
    
    const cleanEmail = sanitizeInput(email);
    const cleanFullName = sanitizeName(fullName);
    const userPassword = password || generateRandomPassword();

    const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanFullName,
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      console.error('Auth user creation returned no user data');
      throw new Error('Auth user creation returned no user data');
    }

    console.log('Auth user created successfully:', authData.user.id);
    return { authData, password: userPassword };
  }

  async createUserProfile(userId: string, email: string, fullName: string, role: string): Promise<any> {
    console.log('=== CREATING USER PROFILE ===');
    
    const cleanEmail = sanitizeInput(email);
    const cleanFullName = sanitizeName(fullName);
    
    const profileData = {
      id: userId,
      email: cleanEmail,
      full_name: cleanFullName,
      role: role,
      is_active: true,
      must_reset_pw: false,
    };
    
    console.log('Profile data to insert:', profileData);
    
    const { data: profileInsertData, error: profileError } = await this.supabaseAdmin
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('=== PROFILE CREATION FAILED ===');
      console.error('Profile error:', profileError);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return profileInsertData;
  }

  async deleteAuthUser(userId: string): Promise<void> {
    console.log('Cleaning up auth user:', userId);
    await this.supabaseAdmin.auth.admin.deleteUser(userId);
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { email, full_name, role, password } = request;
    
    try {
      // Check if user already exists
      const userExists = await this.checkUserExists(email);
      if (userExists) {
        return {
          success: false,
          error: `A user with email ${sanitizeInput(email)} already exists`
        };
      }

      // Create auth user
      const { authData, password: userPassword } = await this.createAuthUser(email, full_name, password);

      try {
        // Create user profile
        const profileData = await this.createUserProfile(authData.user.id, email, full_name, role);

        console.log('=== USER CREATION SUCCESSFUL ===');
        console.log('User ID:', authData.user.id);
        console.log('Profile created:', !!profileData);

        return {
          success: true,
          user: authData.user,
          profile: profileData,
          credentials: {
            email: sanitizeInput(email),
            password: userPassword,
          },
        };

      } catch (profileError: any) {
        // Clean up auth user if profile creation fails
        await this.deleteAuthUser(authData.user.id);
        throw profileError;
      }

    } catch (error: any) {
      console.error('User creation error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        type: 'user_creation_error',
      };
    }
  }
}
