
import { UserRole } from '@/types';

export interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  password: string;
}

export interface CreatedCredentials {
  email: string;
  password: string;
}

export interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}
