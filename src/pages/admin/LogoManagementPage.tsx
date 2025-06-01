
import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LogoUpload from '@/components/admin/LogoUpload';

const LogoManagementPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logo Management</h1>
          <p className="text-muted-foreground">
            Manage the company logo that appears in all print documents
          </p>
        </div>
        
        <LogoUpload />
      </div>
    </DashboardLayout>
  );
};

export default LogoManagementPage;
