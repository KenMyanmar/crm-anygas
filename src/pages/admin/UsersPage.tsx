import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import AddUserModal from '@/components/admin/AddUserModal';
import DataConsistencyChecker from '@/components/admin/DataConsistencyChecker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: error?.message || "Could not load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));

      toast({
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: error?.message || "Could not update user status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        description: `User role updated successfully`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error?.message || "Could not update user role",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is restricted to administrators.
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
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <Button onClick={() => setAddUserModalOpen(true)}>
            Add New User
          </Button>
        </div>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  Manage users, their roles, and permissions in the system. No email invitations are sent - users are created directly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No users found in the system.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr className="text-left text-xs">
                            <th className="pb-2 font-medium">User</th>
                            <th className="pb-2 font-medium">Email</th>
                            <th className="pb-2 font-medium">Role</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium">Password Reset</th>
                            <th className="pb-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {users.map((user) => {
                            const initials = user.full_name
                              ? user.full_name
                                  .split(' ')
                                  .map(name => name[0])
                                  .join('')
                                  .toUpperCase()
                                  .substring(0, 2)
                              : 'U';

                            return (
                              <tr key={user.id} className="text-sm">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={user.profile_pic_url} />
                                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.full_name}</span>
                                  </div>
                                </td>
                                <td className="py-3">{user.email}</td>
                                <td className="py-3">
                                  <Select
                                    value={user.role}
                                    onValueChange={(value: UserRole) => handleUpdateUserRole(user.id, value)}
                                    disabled={user.id === profile?.id}
                                  >
                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="salesperson">Salesperson</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3">
                                  {user.must_reset_pw ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Completed
                                    </span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                    disabled={user.id === profile?.id}
                                  >
                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-6">
            <DataConsistencyChecker />
          </TabsContent>
        </Tabs>

        <AddUserModal
          open={addUserModalOpen}
          onOpenChange={setAddUserModalOpen}
          onUserCreated={fetchUsers}
        />
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
