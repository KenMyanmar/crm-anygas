
import { adminClient } from './supabaseAdmin';
import { DataInconsistency } from '../types/consistencyTypes';

export const scanForInconsistencies = async (): Promise<DataInconsistency[]> => {
  console.log('=== ENHANCED CONSISTENCY SCAN ===');
  const found: DataInconsistency[] = [];

  try {
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

    console.log('Enhanced scan results:', {
      total: found.length,
      critical: found.filter(i => i.severity === 'critical').length,
      high: found.filter(i => i.severity === 'high').length,
      medium: found.filter(i => i.severity === 'medium').length,
      low: found.filter(i => i.severity === 'low').length
    });

    return found;

  } catch (error: any) {
    console.error('Error scanning for inconsistencies:', error);
    throw error;
  }
};
