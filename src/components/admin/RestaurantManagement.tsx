
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Upload, Copy, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasAdminAccess } from '@/utils/roleUtils';
import ImportRestaurants from './restaurant-management/ImportRestaurants';
import DuplicateManager from './restaurant-management/DuplicateManager';
import DeleteAllManager from './restaurant-management/DeleteAllManager';
import AuditLog from './restaurant-management/AuditLog';

const RestaurantManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('import');

  // Check admin access
  if (!hasAdminAccess(profile?.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            <span>Access Denied: Admin privileges required</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Restaurant Management System
          </CardTitle>
          <p className="text-muted-foreground">
            Professional tools for managing restaurant data - Admin access only
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicates
              </TabsTrigger>
              <TabsTrigger value="delete-all" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete All
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="mt-6">
              <ImportRestaurants />
            </TabsContent>

            <TabsContent value="duplicates" className="mt-6">
              <DuplicateManager />
            </TabsContent>

            <TabsContent value="delete-all" className="mt-6">
              <DeleteAllManager />
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <AuditLog />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantManagement;
