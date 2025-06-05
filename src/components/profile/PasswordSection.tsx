
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordSectionProps {
  profile: any;
}

const PasswordSection = ({ profile }: PasswordSectionProps) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: passwordData.current_password,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">Update your account password</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
        >
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </div>

      {isChangingPassword && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSection;
