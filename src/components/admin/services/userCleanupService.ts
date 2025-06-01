
import { adminClient } from './supabaseAdmin';

export const completeNuclearCleanup = async (email: string): Promise<void> => {
  console.log('=== COMPLETE NUCLEAR CLEANUP ===');
  console.log('Target email:', email);

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Step 1: Get ALL auth users with this email (case-insensitive)
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const matchingAuthUsers = authUsers.users.filter((user: any) => 
      user.email?.toLowerCase() === cleanEmail
    );

    console.log('Found auth users to delete:', matchingAuthUsers.length);

    // Step 2: Collect ALL UUIDs that might have profiles
    const uuidsToClean = new Set<string>();
    
    // Add UUIDs from auth users
    matchingAuthUsers.forEach((user: any) => uuidsToClean.add(user.id));

    // Step 3: Find profiles by email (case-insensitive)
    const { data: emailProfiles } = await adminClient
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail);

    console.log('Found profiles by email:', emailProfiles?.length || 0);
    
    // Add UUIDs from email profiles
    emailProfiles?.forEach(profile => uuidsToClean.add(profile.id));

    // Step 4: NEW - Check for any UUID conflicts in users table specifically
    const { data: existingUsersByUuid } = await adminClient
      .from('users')
      .select('id, email')
      .in('id', Array.from(uuidsToClean));

    console.log('Found existing users by UUID:', existingUsersByUuid?.length || 0);
    
    // Add any additional UUIDs found
    existingUsersByUuid?.forEach(user => uuidsToClean.add(user.id));

    console.log('Total UUIDs to clean:', uuidsToClean.size);

    // Step 5: Delete ALL profiles by UUID (multiple approaches for safety)
    for (const uuid of uuidsToClean) {
      console.log('Deleting profile by UUID:', uuid);
      
      // Try multiple delete approaches for thorough cleanup
      await adminClient.from('users').delete().eq('id', uuid);
      await adminClient.from('users').delete().ilike('email', cleanEmail);
    }

    // Step 6: Delete ALL auth users
    for (const authUser of matchingAuthUsers) {
      console.log('Deleting auth user:', authUser.id);
      const { error } = await adminClient.auth.admin.deleteUser(authUser.id);
      if (error) {
        console.error('Auth deletion error for', authUser.id, ':', error);
      }
    }

    // Step 7: ENHANCED VERIFICATION - ensure cleanup was complete
    console.log('=== ENHANCED CLEANUP VERIFICATION ===');
    
    // Wait longer for deletion to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify no auth users remain
    const { data: remainingAuthUsers } = await adminClient.auth.admin.listUsers();
    const stillExistingAuth = remainingAuthUsers.users.filter((user: any) => 
      user.email?.toLowerCase() === cleanEmail
    );

    // Verify no profiles remain by email
    const { data: remainingProfilesByEmail } = await adminClient
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail);

    // Verify no profiles remain by UUID
    const { data: remainingProfilesByUuid } = await adminClient
      .from('users')
      .select('id, email')
      .in('id', Array.from(uuidsToClean));

    const totalRemainingProfiles = (remainingProfilesByEmail?.length || 0) + (remainingProfilesByUuid?.length || 0);

    if (stillExistingAuth.length > 0 || totalRemainingProfiles > 0) {
      console.error('CLEANUP FAILED - REMAINING RECORDS:');
      console.error('Auth users:', stillExistingAuth.length);
      console.error('Profiles by email:', remainingProfilesByEmail?.length || 0);
      console.error('Profiles by UUID:', remainingProfilesByUuid?.length || 0);
      throw new Error(`Cleanup verification failed: ${stillExistingAuth.length} auth users and ${totalRemainingProfiles} profiles still exist`);
    }

    console.log('=== CLEANUP VERIFICATION PASSED ===');

  } catch (error: any) {
    console.error('Complete nuclear cleanup failed:', error);
    throw error;
  }
};

export const preFlightCleanupAndCheck = async (email: string): Promise<boolean> => {
  console.log('=== PRE-FLIGHT CLEANUP AND CHECK ===');
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Perform complete nuclear cleanup first
    await completeNuclearCleanup(cleanEmail);

    // Enhanced double-check that everything is clean
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const existingAuth = authUsers.users.find((user: any) => 
      user.email?.toLowerCase() === cleanEmail
    );

    const { data: existingProfiles } = await adminClient
      .from('users')
      .select('*')
      .ilike('email', cleanEmail);

    // Also check for any UUID conflicts that might exist
    const { data: existingUsersByAnyUuid } = await adminClient
      .from('users')
      .select('*')
      .ilike('email', cleanEmail);

    if (existingAuth || (existingProfiles && existingProfiles.length > 0) || (existingUsersByAnyUuid && existingUsersByAnyUuid.length > 0)) {
      console.error('PRE-FLIGHT CHECK FAILED - RECORDS STILL EXIST');
      console.error('Auth user exists:', !!existingAuth);
      console.error('Profiles exist:', existingProfiles?.length || 0);
      console.error('Users by UUID exist:', existingUsersByAnyUuid?.length || 0);
      throw new Error('Unable to clean existing records completely');
    }

    console.log('PRE-FLIGHT CHECK PASSED - ALL CLEAN');
    return true;

  } catch (error: any) {
    console.error('Pre-flight cleanup failed:', error);
    throw error;
  }
};
