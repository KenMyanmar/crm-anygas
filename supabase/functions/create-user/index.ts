
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CreateUserRequest, CreateUserResponse } from './types.ts';
import { validateCreateUserRequest, validateEnvironment } from './validation.ts';
import { UserService } from './userService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: error,
    }),
    {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

function createSuccessResponse(data: CreateUserResponse): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== CREATE USER EDGE FUNCTION ===');
  console.log('Method:', req.method);

  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return createErrorResponse('Method not allowed', 405);
    }

    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.error);
      return createErrorResponse(envValidation.error!, 500);
    }

    // Parse and validate request body
    const requestBody = await req.json();
    const validation = validateCreateUserRequest(requestBody);
    
    if (!validation.isValid) {
      console.error('Request validation failed:', validation.error);
      return createErrorResponse(validation.error!, 400);
    }

    const createUserRequest: CreateUserRequest = requestBody;
    
    console.log('=== REQUEST DATA ===');
    console.log('Email:', createUserRequest.email);
    console.log('Full Name:', createUserRequest.full_name);
    console.log('Role:', createUserRequest.role);
    console.log('Has Password:', !!createUserRequest.password);

    // Create user using service
    const userService = new UserService();
    const result = await userService.createUser(createUserRequest);

    if (result.success) {
      return createSuccessResponse(result);
    } else {
      const status = result.error?.includes('already exists') ? 409 : 500;
      return createErrorResponse(result.error!, status);
    }

  } catch (error: any) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    return createErrorResponse(
      error.message || 'An unexpected error occurred',
      500
    );
  }
});
