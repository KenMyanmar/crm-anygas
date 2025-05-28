
import { adminClient } from './supabaseAdmin';
import { DataInconsistency } from '../types/consistencyTypes';

export const fixInconsistency = async (inconsistency: DataInconsistency): Promise<void> => {
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
  } catch (error: any) {
    console.error('Error fixing inconsistency:', error);
    throw error;
  }
};
