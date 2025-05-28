import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle, CheckCircle, RefreshCw, Trash2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DataInconsistency {
  type: 'ORPHANED_AUTH' | 'ORPHANED_PROFILE' | 'UUID_COLLISION' | 'EMAIL_MISMATCH';
  email: string;
  authUserId?: string;
  profileId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SUPABASE_URL = 'https://fblcilccdjicyosmuome.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibGNpbGNjZGppY3lvc211b21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk3NzMzMywiZXhwIjoyMDYyNTUzMzMzfQ.CaTkwECtJrGNvSFcM00Y8WZvDvqHNw6CsdJF2LB3qM8';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DataConsistencyChecker = () => {
  const [inconsistencies, setInconsistencies] = useState<DataInconsistency[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [isEmergencyCleanup, setIsEmergencyCleanup] = useState(false);
  const { toast } = useToast();

  // Emergency cleanup function for specific email
  const emergencyCleanupByEmail = async (email: string) => {
    console.log('=== EMERGENCY CLEANUP ===');
    console.log('Target email:', email);

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (!cleanEmail) {
        throw new Error('Email is required');
      }

      // Step 1: Get ALL auth users with this email
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const matchingAuthUsers = authUsers.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      // Step 2: Get ALL profiles with this email or matching UUIDs
      const uuidsToClean = new Set<string>();
      matchingAuthUsers.forEach(user => uuidsToClean.add(user.id));

      const { data: emailProfiles } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      emailProfiles?.forEach(profile => uuidsToClean.add(profile.id));

      console.log('Found to delete:', {
        authUsers: matchingAuthUsers.length,
        profiles: emailProfiles?.length || 0,
        totalUUIDs: uuidsToClean.size
      });

      // Step 3: Delete ALL profiles (multiple approaches)
      for (const uuid of uuidsToClean) {
        await adminClient.from('users').delete().eq('id', uuid);
      }
      
      // Also delete by email pattern
      await adminClient.from('users').delete().ilike('email', cleanEmail);

      // Step 4: Delete ALL auth users
      for (const authUser of matchingAuthUsers) {
        const { error } = await adminClient.auth.admin.deleteUser(authUser.id);
        if (error) {
          console.error('Auth deletion error:', error);
        }
      }

      // Step 5: Wait and verify
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verification
      const { data: verifyAuth } = await adminClient.auth.admin.listUsers();
      const remainingAuth = verifyAuth.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      const { data: verifyProfiles } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      console.log('Cleanup results:', {
        deletedAuthUsers: matchingAuthUsers.length,
        deletedProfiles: emailProfiles?.length || 0,
        remainingAuth: remainingAuth.length,
        remainingProfiles: verifyProfiles?.length || 0
      });

      if (remainingAuth.length === 0 && (!verifyProfiles || verifyProfiles.length === 0)) {
        toast({
          description: `Emergency cleanup successful for ${email}`,
        });
      } else {
        toast({
          title: "Partial cleanup",
          description: `Some records may still exist: ${remainingAuth.length} auth, ${verifyProfiles?.length || 0} profiles`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Emergency cleanup failed:', error);
      toast({
        title: "Emergency cleanup failed",
        description: error.message || 'Failed to cleanup user data',
        variant: "destructive",
      });
    }
  };

  const scanForInconsistencies = async () => {
    setIsScanning(true);
    console.log('=== ENHANCED CONSISTENCY SCAN ===');

    try {
      const found: DataInconsistency[] = [];

      // Get all auth users
      const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Failed to fetch auth users: ${authError.message}`);
      }

      // Get all profiles
      const { data: profiles, error: profileError } = await adminClient
        .from('users')
        .select('*');
      if (profileError) {
        throw new Error(`Failed to fetch profiles: ${profileError.message}`);
      }

      console.log('Auth users found:', authUsers.users.length);
      console.log('Profiles found:', profiles?.length || 0);

      // Check for orphaned auth users (auth exists but no profile with matching UUID)
      for (const authUser of authUsers.users) {
        if (!authUser.email) continue;
        
        const hasMatchingProfile = profiles?.some(profile => 
          profile.id === authUser.id
        );
        
        if (!hasMatchingProfile) {
          // Check if there's a profile with same email but different UUID
          const emailProfile = profiles?.find(profile => 
            profile.email.toLowerCase() === authUser.email?.toLowerCase()
          );
          
          if (emailProfile) {
            found.push({
              type: 'UUID_COLLISION',
              email: authUser.email,
              authUserId: authUser.id,
              profileId: emailProfile.id,
              details: `Auth user UUID ${authUser.id} doesn't match profile UUID ${emailProfile.id} for same email`,
              severity: 'critical'
            });
          } else {
            found.push({
              type: 'ORPHANED_AUTH',
              email: authUser.email,
              authUserId: authUser.id,
              details: `Auth user exists without any corresponding profile`,
              severity: 'high'
            });
          }
        }
      }

      // Check for orphaned profiles (profile exists but no auth with matching UUID)
      for (const profile of profiles || []) {
        const hasMatchingAuthUser = authUsers.users.some(authUser => 
          authUser.id === profile.id
        );
        
        if (!hasMatchingAuthUser) {
          // Check if there's an auth user with same email but different UUID
          const emailAuthUser = authUsers.users.find(authUser => 
            authUser.email?.toLowerCase() === profile.email.toLowerCase()
          );
          
          if (emailAuthUser) {
            found.push({
              type: 'UUID_COLLISION',
              email: profile.email,
              authUserId: emailAuthUser.id,
              profileId: profile.id,
              details: `Profile UUID ${profile.id} doesn't match auth user UUID ${emailAuthUser.id} for same email`,
              severity: 'critical'
            });
          } else {
            found.push({
              type: 'ORPHANED_PROFILE',
              email: profile.email,
              profileId: profile.id,
              details: `Profile exists without any corresponding auth user`,
              severity: 'medium'
            });
          }
        }
      }

      // Check for email mismatches (same UUID but different emails)
      for (const authUser of authUsers.users) {
        if (!authUser.email) continue;
        
        const matchingProfile = profiles?.find(profile => profile.id === authUser.id);
        if (matchingProfile && matchingProfile.email.toLowerCase() !== authUser.email.toLowerCase()) {
          found.push({
            type: 'EMAIL_MISMATCH',
            email: authUser.email,
            authUserId: authUser.id,
            profileId: matchingProfile.id,
            details: `Auth email "${authUser.email}" doesn't match profile email "${matchingProfile.email}" for UUID ${authUser.id}`,
            severity: 'high'
          });
        }
      }

      setInconsistencies(found);
      setLastScanTime(new Date());

      console.log('Enhanced scan results:', {
        total: found.length,
        critical: found.filter(i => i.severity === 'critical').length,
        high: found.filter(i => i.severity === 'high').length,
        medium: found.filter(i => i.severity === 'medium').length,
        low: found.filter(i => i.severity === 'low').length
      });

      if (found.length === 0) {
        toast({
          description: "No data inconsistencies found. System is healthy!",
        });
      } else {
        const criticalCount = found.filter(i => i.severity === 'critical').length;
        toast({
          title: "Data inconsistencies detected",
          description: `Found ${found.length} issue(s) including ${criticalCount} critical problem(s)`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Error scanning for inconsistencies:', error);
      toast({
        title: "Scan failed",
        description: error.message || 'Failed to scan for inconsistencies',
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fixInconsistency = async (inconsistency: DataInconsistency) => {
    console.log('=== FIXING INCONSISTENCY ===');
    console.log('Type:', inconsistency.type);
    console.log('Email:', inconsistency.email);

    try {
      switch (inconsistency.type) {
        case 'ORPHANED_AUTH':
          // Delete orphaned auth user
          if (inconsistency.authUserId) {
            const { error } = await adminClient.auth.admin.deleteUser(inconsistency.authUserId);
            if (error) {
              throw new Error(`Failed to delete auth user: ${error.message}`);
            }
            console.log('Orphaned auth user deleted');
          }
          break;

        case 'ORPHANED_PROFILE':
          // Delete orphaned profile
          const { error: profileDeleteError } = await adminClient
            .from('users')
            .delete()
            .eq('email', inconsistency.email);
          
          if (profileDeleteError) {
            throw new Error(`Failed to delete profile: ${profileDeleteError.message}`);
          }
          console.log('Orphaned profile deleted');
          break;

        case 'UUID_COLLISION':
          // For UUID collisions, we need to do a complete cleanup
          console.log('Performing nuclear cleanup for UUID collision...');
          
          // Delete all profiles with this email
          await adminClient
            .from('users')
            .delete()
            .ilike('email', inconsistency.email);
          
          // Delete all auth users with this email
          const { data: authUsers } = await adminClient.auth.admin.listUsers();
          const matchingAuthUsers = authUsers.users.filter(user => 
            user.email?.toLowerCase() === inconsistency.email.toLowerCase()
          );
          
          for (const authUser of matchingAuthUsers) {
            await adminClient.auth.admin.deleteUser(authUser.id);
          }
          
          console.log('UUID collision resolved with nuclear cleanup');
          break;

        case 'EMAIL_MISMATCH':
          // Update profile email to match auth user email
          if (inconsistency.authUserId) {
            const { error: updateError } = await adminClient
              .from('users')
              .update({ email: inconsistency.email })
              .eq('id', inconsistency.authUserId);
            
            if (updateError) {
              throw new Error(`Failed to update profile email: ${updateError.message}`);
            }
            console.log('Profile email updated to match auth user');
          }
          break;
      }

      // Remove from inconsistencies list
      setInconsistencies(prev => prev.filter(item => 
        !(item.email === inconsistency.email && item.type === inconsistency.type)
      ));

      toast({
        description: `Fixed ${inconsistency.type.toLowerCase().replace('_', ' ')} for ${inconsistency.email}`,
      });

    } catch (error: any) {
      console.error('Error fixing inconsistency:', error);
      toast({
        title: "Fix failed",
        description: error.message || 'Failed to fix inconsistency',
        variant: "destructive",
      });
    }
  };

  const fixAllInconsistencies = async () => {
    setIsFixing(true);
    
    try {
      // Sort by severity (critical first)
      const sortedInconsistencies = [...inconsistencies].sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      for (const inconsistency of sortedInconsistencies) {
        await fixInconsistency(inconsistency);
        // Small delay between fixes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        description: "All inconsistencies have been resolved",
      });

    } catch (error: any) {
      toast({
        title: "Bulk fix failed",
        description: "Some inconsistencies could not be resolved",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getInconsistencyBadgeVariant = (type: DataInconsistency['type'], severity: DataInconsistency['severity']) => {
    if (severity === 'critical') return 'destructive' as const;
    if (severity === 'high') return 'destructive' as const;
    if (severity === 'medium') return 'secondary' as const;
    return 'outline' as const;
  };

  const getSeverityColor = (severity: DataInconsistency['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Enhanced Data Consistency Checker
        </CardTitle>
        <CardDescription>
          Comprehensive scan for data inconsistencies including UUID collisions, orphaned records, and email mismatches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={scanForInconsistencies} 
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Enhanced Scan'}
          </Button>
          
          {inconsistencies.length > 0 && (
            <Button 
              variant="destructive"
              onClick={fixAllInconsistencies} 
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {isFixing ? 'Fixing...' : 'Fix All Issues'}
            </Button>
          )}
        </div>

        {/* Emergency Cleanup Section */}
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergency Manual Cleanup
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Use this to forcefully remove ALL traces of a user by email when UUID collisions persist.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email to cleanup"
              value={emergencyEmail}
              onChange={(e) => setEmergencyEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="destructive"
              onClick={() => {
                setIsEmergencyCleanup(true);
                emergencyCleanupByEmail(emergencyEmail).finally(() => {
                  setIsEmergencyCleanup(false);
                  setEmergencyEmail('');
                });
              }}
              disabled={isEmergencyCleanup || !emergencyEmail.trim()}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isEmergencyCleanup ? 'Cleaning...' : 'Emergency Cleanup'}
            </Button>
          </div>
        </div>

        {lastScanTime && (
          <div className="text-sm text-muted-foreground">
            Last scan: {lastScanTime.toLocaleString()}
          </div>
        )}

        {inconsistencies.length === 0 && lastScanTime && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No data inconsistencies found. System is healthy!
            </AlertDescription>
          </Alert>
        )}

        {inconsistencies.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              Found {inconsistencies.length} inconsistenc{inconsistencies.length === 1 ? 'y' : 'ies'}:
            </div>
            
            {inconsistencies.map((inconsistency, index) => (
              <div key={index} className="p-3 border rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getInconsistencyBadgeVariant(inconsistency.type, inconsistency.severity)}>
                      {inconsistency.type.replace('_', ' ')}
                    </Badge>
                    <span className={`text-xs font-medium uppercase ${getSeverityColor(inconsistency.severity)}`}>
                      {inconsistency.severity}
                    </span>
                    <span className="font-medium">{inconsistency.email}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fixInconsistency(inconsistency)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Fix
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {inconsistency.details}
                </div>
                {inconsistency.authUserId && (
                  <div className="text-xs text-muted-foreground">
                    Auth ID: {inconsistency.authUserId}
                  </div>
                )}
                {inconsistency.profileId && (
                  <div className="text-xs text-muted-foreground">
                    Profile ID: {inconsistency.profileId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataConsistencyChecker;
