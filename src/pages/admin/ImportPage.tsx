
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, Database, Users, FileText, Shield } from 'lucide-react';
import PageContainer from '@/components/layouts/PageContainer';

const ImportPage = () => {
  return (
    <PageContainer title="Data Import">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Import data from external sources into the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    Restaurant Management
                  </CardTitle>
                  <CardDescription>
                    Professional tools for managing restaurant data (Admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p>✓ Import restaurants from CSV</p>
                      <p>✓ Smart duplicate detection & removal</p>
                      <p>✓ Complete database clearing</p>
                      <p>✓ Audit logging & safety features</p>
                    </div>
                    <Link to="/admin/restaurant-management">
                      <Button className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Open Restaurant Management
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Lead Data Import
                  </CardTitle>
                  <CardDescription>
                    Import leads and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• CSV file imports for leads</p>
                      <p>• Contact data validation</p>
                      <p>• Assignment automation</p>
                    </div>
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Bulk User Import
                  </CardTitle>
                  <CardDescription>
                    Import multiple users (admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Bulk user creation</p>
                      <p>• Role assignment</p>
                      <p>• Password generation</p>
                    </div>
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5" />
                    General Data Import
                  </CardTitle>
                  <CardDescription>
                    Import various data types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Data validation</p>
                      <p>• Error reporting</p>
                      <p>• Progress tracking</p>
                    </div>
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ImportPage;
