
import { adminClient } from './supabaseAdmin';

export const completeNuclearCleanup = async (email: string): Promise<void> => {
  console.log('=== COMPLETE NUCLEAR CLEANUP ===');
  console.log('Target email:', email);

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Step 1: Get ALL auth users with this email (case-insensitive)
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const matchingAuthUsers = authUsers.users.filter(user => 
      user.email?.toLowerCase() === cleanEmail
    );

    console.log('Found auth users to delete:', matchingAuthUsers.length);

    // Step 2: Collect ALL UUIDs that might have profiles
    const uuidsToClean = new Set<string>();
    
    // Add UUIDs from auth users
    matchingAuthUsers.forEach(user => uuidsToClean.add(user.id));

    // Step 3: Find profiles by email (case-insensitive)
    const { data: emailProfiles } = await adminClient
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail);

    console.log('Found profiles by email:', emailProfiles?.length || 0);
    
    // Add UUIDs from email profiles
    emailProfiles?.forEach(profile => uuidsToClean.add(profile.id));

    console.log('Total UUIDs to clean:', uuidsToClean.size);

    // Step 4: Delete ALL profiles by UUID (multiple approaches for safety)
    for (const uuid of uuidsToClean) {
      console.log('Deleting profile by UUID:', uuid);
      
      // Try multiple delete approaches
      await adminClient.from('users').delete().eq('id', uuid);
      await adminClient.from('users').delete().ilike('email', cleanEmail);
    }

    // Step 5: Delete ALL auth users
    for (const authUser of matchingAuthUsers) {
      console.log('Deleting auth user:', authUser.id);
      const { error } = await adminClient.auth.admin.deleteUser(authUser.id);
      if (error) {
        console.error('Auth deletion error for', authUser.id, ':', error);
      }
    }

    // Step 6: VERIFICATION - ensure cleanup was complete
    console.log('=== CLEANUP VERIFICATION ===');
    
    // Wait for deletion to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify no auth users remain
    const { data: remainingAuthUsers } = await adminClient.auth.admin.listUsers();
    const stillExistingAuth = remainingAuthUsers.users.filter(user => 
      user.email?.toLowerCase() === cleanEmail
    );

    // Verify no profiles remain
    const { data: remainingProfiles } = await adminClient
      .from('users')
      .select('id, email')
      .or(`email.ilike.${cleanEmail},${Array.from(uuidsToClean).map(uuid => `id.eq.${uuid}`).join(',')}`);

    if (stillExistingAuth.length > 0 || (remainingProfiles && remainingProfiles.length > 0)) {
      console.error('CLEANUP FAILED - REMAINING RECORDS:');
      console.error('Auth users:', stillExistingAuth.length);
      console.error('Profiles:', remainingProfiles?.length || 0);
      throw new Error(`Cleanup verification failed: ${stillExistingAuth.length} auth users and ${remainingProfiles?.length || 0} profiles still exist`);
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

    // Double-check that everything is clean
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const existingAuth = authUsers.users.find(user => 
      user.email?.toLowerCase() === cleanEmail
    );

    const { data: existingProfiles } = await adminClient
      .from('users')
      .select('*')
      .ilike('email', cleanEmail);

    if (existingAuth || (existingProfiles && existingProfiles.length > 0)) {
      console.error('PRE-FLIGHT CHECK FAILED - RECORDS STILL EXIST');
      throw new Error('Unable to clean existing records completely');
    }

    console.log('PRE-FLIGHT CHECK PASSED - ALL CLEAN');
    return true;

  } catch (error: any) {
    console.error('Pre-flight cleanup failed:', error);
    throw error;
  }
};
