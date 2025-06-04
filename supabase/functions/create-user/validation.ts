
import { CreateUserRequest, UserValidationResult } from './types.ts';

export function validateCreateUserRequest(requestBody: any): UserValidationResult {
  const { email, full_name, role } = requestBody;

  if (!email || !full_name || !role) {
    return {
      isValid: false,
      error: 'Missing required fields: email, full_name, and role are required'
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return { isValid: true };
}

export function validateEnvironment(): UserValidationResult {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      isValid: false,
      error: 'Server configuration error: Missing environment variables'
    };
  }

  return { isValid: true };
}
