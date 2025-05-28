
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { isAdminOrManager } from '@/utils/roleUtils';

const ImportPage = () => {
  const { profile } = useAuth();

  if (!isAdminOrManager(profile?.role)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is restricted to administrators and managers.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Data Import</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import data from external sources into the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed rounded-lg p-8 text-center">
              <h2 className="text-lg font-semibold mb-2">Import Page Coming Soon</h2>
              <p className="text-muted-foreground">
                The full implementation will include:
              </p>
              <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
                <li>CSV file imports for restaurants</li>
                <li>Lead data import capabilities</li>
                <li>Bulk user import (admin only)</li>
                <li>Data validation and error reporting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ImportPage;
