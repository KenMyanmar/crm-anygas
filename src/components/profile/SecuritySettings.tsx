
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import PasswordSection from './PasswordSection';
import EmailSection from './EmailSection';

interface SecuritySettingsProps {
  profile: any;
}

const SecuritySettings = ({ profile }: SecuritySettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password */}
        <PasswordSection profile={profile} />

        <Separator />

        {/* Change Email */}
        <EmailSection profile={profile} />
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
