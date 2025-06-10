
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Database, Settings, Shield, Activity, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      link: '/admin/users',
      status: 'Active',
    },
    {
      title: 'Restaurant Management',
      description: 'Import, manage, and organize restaurant data',
      icon: Database,
      link: '/admin/restaurants',
      status: 'Active',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      link: '/admin/settings',
      status: 'Active',
    },
    {
      title: 'Data Migration',
      description: 'Handle data imports and migrations',
      icon: Activity,
      link: '/admin/migration',
      status: 'Maintenance',
    },
    {
      title: 'Security',
      description: 'Security settings and access controls',
      icon: Shield,
      link: '/admin/security',
      status: 'Development',
    },
    {
      title: 'Analytics',
      description: 'System analytics and reporting',
      icon: BarChart3,
      link: '/admin/analytics',
      status: 'Development',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Development':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage system settings, users, and data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(section.status)}>
                      {section.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                  <Link to={section.link}>
                    <Button 
                      className="w-full" 
                      disabled={section.status !== 'Active'}
                    >
                      {section.status === 'Active' ? 'Access' : 'Coming Soon'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/restaurants">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>
              </Link>
              <Button variant="outline" className="w-full" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
