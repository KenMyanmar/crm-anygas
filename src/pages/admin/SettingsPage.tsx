import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { isAdminOrManager } from '@/utils/roleUtils';

const SettingsPage = () => {
  const { profile } = useAuth();

  if (!isAdminOrManager(profile?.role)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is restricted to administrators and managers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            System-wide configuration settings for the CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Settings Page Coming Soon</h2>
            <p className="text-muted-foreground">
              The full implementation will include:
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>Company information configuration</li>
              <li>Default system-wide settings</li>
              <li>Email notification preferences</li>
              <li>System backup and restore options</li>
              <li>Default product pricing management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
