
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

interface DataInconsistency {
  type: 'ORPHANED_AUTH' | 'ORPHANED_PROFILE';
  email: string;
  authUserId?: string;
  profileId?: string;
  details: string;
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
  const { toast } = useToast();

  const scanForInconsistencies = async () => {
    setIsScanning(true);
    console.log('=== SCANNING FOR DATA INCONSISTENCIES ===');

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

      // Check for orphaned auth users (auth exists but no profile)
      for (const authUser of authUsers.users) {
        if (!authUser.email) continue;
        
        const hasProfile = profiles?.some(profile => 
          profile.email.toLowerCase() === authUser.email?.toLowerCase()
        );
        
        if (!hasProfile) {
          found.push({
            type: 'ORPHANED_AUTH',
            email: authUser.email,
            authUserId: authUser.id,
            details: `Auth user exists without corresponding profile`
          });
        }
      }

      // Check for orphaned profiles (profile exists but no auth)
      for (const profile of profiles || []) {
        const hasAuthUser = authUsers.users.some(authUser => 
          authUser.email?.toLowerCase() === profile.email.toLowerCase()
        );
        
        if (!hasAuthUser) {
          found.push({
            type: 'ORPHANED_PROFILE',
            email: profile.email,
            profileId: profile.id,
            details: `Profile exists without corresponding auth user`
          });
        }
      }

      setInconsistencies(found);
      setLastScanTime(new Date());

      console.log('Inconsistencies found:', found.length);

      if (found.length === 0) {
        toast({
          description: "No data inconsistencies found. System is healthy!",
        });
      } else {
        toast({
          title: "Data inconsistencies detected",
          description: `Found ${found.length} issue(s) that need attention`,
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
      if (inconsistency.type === 'ORPHANED_AUTH') {
        // Delete orphaned auth user
        if (inconsistency.authUserId) {
          const { error } = await adminClient.auth.admin.deleteUser(inconsistency.authUserId);
          if (error) {
            throw new Error(`Failed to delete auth user: ${error.message}`);
          }
          console.log('Orphaned auth user deleted');
        }
      } else if (inconsistency.type === 'ORPHANED_PROFILE') {
        // Delete orphaned profile
        const { error } = await adminClient
          .from('users')
          .delete()
          .eq('email', inconsistency.email);
        
        if (error) {
          throw new Error(`Failed to delete profile: ${error.message}`);
        }
        console.log('Orphaned profile deleted');
      }

      // Remove from inconsistencies list
      setInconsistencies(prev => prev.filter(item => 
        item.email !== inconsistency.email || item.type !== inconsistency.type
      ));

      toast({
        description: `Fixed inconsistency for ${inconsistency.email}`,
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
      for (const inconsistency of inconsistencies) {
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

  const getInconsistencyBadgeVariant = (type: DataInconsistency['type']) => {
    switch (type) {
      case 'ORPHANED_AUTH':
        return 'destructive' as const;
      case 'ORPHANED_PROFILE':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Data Consistency Checker
        </CardTitle>
        <CardDescription>
          Scan for and resolve data inconsistencies between auth users and profiles.
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
            {isScanning ? 'Scanning...' : 'Scan for Issues'}
          </Button>
          
          {inconsistencies.length > 0 && (
            <Button 
              variant="destructive"
              onClick={fixAllInconsistencies} 
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isFixing ? 'Fixing...' : 'Fix All Issues'}
            </Button>
          )}
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
                    <Badge variant={getInconsistencyBadgeVariant(inconsistency.type)}>
                      {inconsistency.type.replace('_', ' ')}
                    </Badge>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataConsistencyChecker;
