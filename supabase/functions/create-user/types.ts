
export interface CreateUserRequest {
  email: string;
  full_name: string;
  role: string;
  password?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: any;
  profile?: any;
  credentials?: {
    email: string;
    password: string;
  };
  error?: string;
  type?: string;
}

export interface UserValidationResult {
  isValid: boolean;
  error?: string;
}
