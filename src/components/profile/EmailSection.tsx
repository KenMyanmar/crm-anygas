
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface EmailSectionProps {
  profile: any;
}

const EmailSection = ({ profile }: EmailSectionProps) => {
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailData, setEmailData] = useState({
    new_email: '',
  });

  const handleChangeEmail = async () => {
    if (!emailData.new_email || emailData.new_email === profile?.email) {
      toast({
        title: "Invalid email",
        description: "Please enter a different email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.new_email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email change initiated",
        description: "Check your new email inbox to confirm the change. Your old email will remain active until confirmed.",
      });

      setEmailData({ new_email: '' });
      setIsChangingEmail(false);
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: "Error changing email",
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
          <h3 className="font-medium">Email Address</h3>
          <p className="text-sm text-muted-foreground">Update your email address</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsChangingEmail(!isChangingEmail)}
        >
          <Mail className="w-4 h-4 mr-2" />
          Change Email
        </Button>
      </div>

      {isChangingEmail && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="new_email">New Email Address</Label>
            <Input
              id="new_email"
              type="email"
              value={emailData.new_email}
              onChange={(e) => setEmailData(prev => ({ ...prev, new_email: e.target.value }))}
              placeholder="Enter new email address"
            />
            <p className="text-xs text-muted-foreground">
              You'll receive a confirmation email at the new address. Your old email will remain active until confirmed.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleChangeEmail} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Confirmation'}
            </Button>
            <Button variant="outline" onClick={() => setIsChangingEmail(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSection;
