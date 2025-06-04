
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types';
import { generateRandomPassword } from '../services/passwordService';
import { UserFormData } from '../types/userTypes';

interface CreateUserFormProps {
  onSubmit: (formData: UserFormData) => void;
  isProcessing: boolean;
  onCancel: () => void;
}

const CreateUserForm = ({ onSubmit, isProcessing, onCancel }: CreateUserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'salesperson' as UserRole,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    setFormData(prev => ({ ...prev, password }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debouncing: prevent rapid submissions
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      console.log('Preventing rapid submission');
      return;
    }
    setLastSubmitTime(now);

    // Enhanced validation
    if (!formData.email.trim() || !formData.full_name.trim()) {
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      return;
    }

    onSubmit(formData);
  };

  const isFormValid = formData.email.trim() && 
                     formData.full_name.trim() && 
                     validateEmail(formData.email.trim());

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="John Doe"
            required
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="user@example.com"
            required
            disabled={isProcessing}
          />
          {formData.email && !validateEmail(formData.email) && (
            <p className="text-xs text-red-500">Please enter a valid email address</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="salesperson">Salesperson</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Initial Password</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to auto-generate"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isProcessing}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGeneratePassword}
              disabled={isProcessing}
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If left blank, a 12-character random password will be generated
          </p>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isProcessing || !isFormValid}
          className="flex-1"
        >
          {isProcessing ? 'Creating User...' : 'Create User'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
