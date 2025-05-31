
import { supabase } from '@/lib/supabase';

export interface DuplicateGroup {
  id: string;
  restaurants: any[];
  duplicateType: 'exact' | 'similar';
  reason: string;
  autoRemovable: boolean;
}

export interface DuplicateStats {
  exactDuplicates: number;
  exactDuplicateGroups: number;
  similarRestaurants: number;
  similarGroups: number;
  totalRemovable: number;
}

// Normalize text for comparison
const normalizeText = (text: string | null): string => {
  if (!text) return '';
  return text.toLowerCase().trim();
};

// Normalize phone number for comparison
const normalizePhone = (phone: string | null): string => {
  if (!phone) return '';
  return phone.replace(/[\s-]/g, '');
};

// Create unique key for exact duplicate detection
const createDuplicateKey = (restaurant: any): string => {
  const name = normalizeText(restaurant.name);
  const township = normalizeText(restaurant.township);
  const phone = normalizePhone(restaurant.phone);
  return `${name}|${township}|${phone}`;
};

export const findDuplicateRestaurants = async (): Promise<{
  groups: DuplicateGroup[];
  stats: DuplicateStats;
}> => {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const duplicateGroups: DuplicateGroup[] = [];
    const exactDuplicateMap = new Map<string, any[]>();
    const similarNameMap = new Map<string, any[]>();
    const processed = new Set<string>();

    // Phase 1: Find exact duplicates (same name + township + phone)
    for (const restaurant of restaurants) {
      const key = createDuplicateKey(restaurant);
      
      // Skip restaurants with missing critical info for exact matching
      if (!restaurant.name || !restaurant.township || !restaurant.phone) {
        continue;
      }
      
      if (!exactDuplicateMap.has(key)) {
        exactDuplicateMap.set(key, []);
      }
      exactDuplicateMap.get(key)!.push(restaurant);
    }

    // Process exact duplicates
    let exactDuplicateCount = 0;
    for (const [key, group] of exactDuplicateMap) {
      if (group.length > 1) {
        // Sort by completeness (most complete record first)
        group.sort((a, b) => {
          const scoreA = [a.address, a.contact_person, a.remarks].filter(Boolean).length;
          const scoreB = [b.address, b.contact_person, b.remarks].filter(Boolean).length;
          return scoreB - scoreA || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        duplicateGroups.push({
          id: `exact_${duplicateGroups.length}`,
          restaurants: group,
          duplicateType: 'exact',
          reason: 'Exact match: Same name, township, and phone number',
          autoRemovable: true,
        });

        exactDuplicateCount += group.length - 1;
        group.forEach(r => processed.add(r.id));
      }
    }

    // Phase 2: Find similar names (same name + township, different phone)
    for (const restaurant of restaurants) {
      if (processed.has(restaurant.id) || !restaurant.name || !restaurant.township) {
        continue;
      }

      const nameKey = `${normalizeText(restaurant.name)}|${normalizeText(restaurant.township)}`;
      
      if (!similarNameMap.has(nameKey)) {
        similarNameMap.set(nameKey, []);
      }
      similarNameMap.get(nameKey)!.push(restaurant);
    }

    // Process similar names (potential chains)
    let similarRestaurantCount = 0;
    for (const [key, group] of similarNameMap) {
      if (group.length > 1) {
        const phoneGroups = new Map<string, any[]>();
        for (const restaurant of group) {
          const phoneKey = normalizePhone(restaurant.phone);
          if (!phoneGroups.has(phoneKey)) {
            phoneGroups.set(phoneKey, []);
          }
          phoneGroups.get(phoneKey)!.push(restaurant);
        }

        if (phoneGroups.size > 1) {
          duplicateGroups.push({
            id: `similar_${duplicateGroups.length}`,
            restaurants: group,
            duplicateType: 'similar',
            reason: `Chain restaurants: Same name and township, ${phoneGroups.size} different phone numbers`,
            autoRemovable: false,
          });

          similarRestaurantCount += group.length;
        }
      }
    }

    const stats: DuplicateStats = {
      exactDuplicates: exactDuplicateCount,
      exactDuplicateGroups: duplicateGroups.filter(g => g.duplicateType === 'exact').length,
      similarRestaurants: similarRestaurantCount,
      similarGroups: duplicateGroups.filter(g => g.duplicateType === 'similar').length,
      totalRemovable: exactDuplicateCount,
    };

    return { groups: duplicateGroups, stats };
  } catch (error: any) {
    console.error('Error finding duplicates:', error);
    throw error;
  }
};

export const removeAllExactDuplicates = async (
  onProgress?: (progress: number, message: string) => void
): Promise<{ success: boolean; removed: number; message: string }> => {
  try {
    if (onProgress) onProgress(10, 'Finding exact duplicates...');
    
    const { groups } = await findDuplicateRestaurants();
    const exactGroups = groups.filter(g => g.duplicateType === 'exact');
    
    if (exactGroups.length === 0) {
      return {
        success: true,
        removed: 0,
        message: 'No exact duplicates found to remove'
      };
    }

    if (onProgress) onProgress(20, 'Preparing duplicate removal...');

    let totalRemoved = 0;
    let totalFailed = 0;
    const failedDeletions: string[] = [];
    const totalGroups = exactGroups.length;

    // Process each exact duplicate group
    for (let i = 0; i < exactGroups.length; i++) {
      const group = exactGroups[i];
      const keepId = group.restaurants[0].id;
      const removeIds = group.restaurants.slice(1).map(r => r.id);

      if (onProgress) {
        const progress = 20 + ((i / totalGroups) * 70);
        onProgress(progress, `Processing group ${i + 1}/${totalGroups}: ${group.restaurants[0].name}...`);
      }

      try {
        await removeDuplicateRestaurantWithTransaction(keepId, removeIds);
        totalRemoved += removeIds.length;
      } catch (error: any) {
        console.error(`Failed to remove duplicates for group ${i + 1}:`, error);
        totalFailed += removeIds.length;
        failedDeletions.push(`${group.restaurants[0].name} (${error.message})`);
      }
    }

    if (onProgress) onProgress(95, 'Logging operation...');

    // Log the bulk operation
    await supabase
      .from('migration_log')
      .insert({
        action: 'BULK_DELETE_EXACT_DUPLICATES',
        table_name: 'restaurants',
        record_count: totalRemoved,
        details: {
          exact_duplicate_groups: exactGroups.length,
          total_removed: totalRemoved,
          total_failed: totalFailed,
          failed_deletions: failedDeletions,
          auto_processed: true,
        },
      });

    if (onProgress) onProgress(100, 'Complete!');

    if (totalFailed > 0) {
      return {
        success: false,
        removed: totalRemoved,
        message: `Partially successful: Removed ${totalRemoved} duplicates, failed to remove ${totalFailed}. Failed items: ${failedDeletions.join(', ')}`
      };
    }

    return {
      success: true,
      removed: totalRemoved,
      message: `Successfully removed ${totalRemoved} exact duplicates from ${exactGroups.length} groups`
    };

  } catch (error: any) {
    console.error('Error removing exact duplicates:', error);
    return {
      success: false,
      removed: 0,
      message: error.message
    };
  }
};

export const removeDuplicateRestaurant = async (keepId: string, removeIds: string[]) => {
  return removeDuplicateRestaurantWithTransaction(keepId, removeIds);
};

const removeDuplicateRestaurantWithTransaction = async (keepId: string, removeIds: string[]) => {
  console.log(`Starting duplicate removal: keeping ${keepId}, removing ${removeIds.join(', ')}`);
  
  // Use a transaction-like approach by processing sequentially
  for (const removeId of removeIds) {
    try {
      // Step 1: Transfer all dependencies sequentially
      console.log(`Transferring dependencies for restaurant ${removeId} to ${keepId}`);
      
      // Transfer orders (most critical)
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (ordersError) {
        console.error('Error transferring orders:', ordersError);
        throw new Error(`Failed to transfer orders: ${ordersError.message}`);
      }

      // Transfer leads
      const { error: leadsError } = await supabase
        .from('leads')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (leadsError) {
        console.error('Error transferring leads:', leadsError);
        throw new Error(`Failed to transfer leads: ${leadsError.message}`);
      }

      // Transfer visit tasks
      const { error: visitTasksError } = await supabase
        .from('visit_tasks')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (visitTasksError) {
        console.error('Error transferring visit tasks:', visitTasksError);
        throw new Error(`Failed to transfer visit tasks: ${visitTasksError.message}`);
      }

      // Transfer meetings
      const { error: meetingsError } = await supabase
        .from('meetings')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (meetingsError) {
        console.error('Error transferring meetings:', meetingsError);
        throw new Error(`Failed to transfer meetings: ${meetingsError.message}`);
      }

      // Transfer calls
      const { error: callsError } = await supabase
        .from('calls')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (callsError) {
        console.error('Error transferring calls:', callsError);
        throw new Error(`Failed to transfer calls: ${callsError.message}`);
      }

      // Transfer notes (check target_type enum values)
      const { error: notesError } = await supabase
        .from('notes')
        .update({ target_id: keepId })
        .eq('target_id', removeId)
        .eq('target_type', 'RESTAURANT');
      
      if (notesError) {
        console.error('Error transferring notes:', notesError);
        // Don't throw error for notes as the enum might not support RESTAURANT
        console.log('Notes transfer failed, but continuing...');
      }

      // Transfer voice notes
      const { error: voiceNotesError } = await supabase
        .from('voice_notes')
        .update({ restaurant_id: keepId })
        .eq('restaurant_id', removeId);
      
      if (voiceNotesError) {
        console.error('Error transferring voice notes:', voiceNotesError);
        throw new Error(`Failed to transfer voice notes: ${voiceNotesError.message}`);
      }

      // Step 2: Verify all dependencies have been transferred
      console.log(`Verifying dependency transfer for restaurant ${removeId}`);
      
      const verificationQueries = await Promise.all([
        supabase.from('orders').select('id').eq('restaurant_id', removeId).limit(1),
        supabase.from('leads').select('id').eq('restaurant_id', removeId).limit(1),
        supabase.from('visit_tasks').select('id').eq('restaurant_id', removeId).limit(1),
        supabase.from('meetings').select('id').eq('restaurant_id', removeId).limit(1),
        supabase.from('calls').select('id').eq('restaurant_id', removeId).limit(1),
        supabase.from('voice_notes').select('id').eq('restaurant_id', removeId).limit(1),
      ]);

      const hasRemainingDependencies = verificationQueries.some(
        ({ data }) => data && data.length > 0
      );

      if (hasRemainingDependencies) {
        throw new Error(`Restaurant ${removeId} still has dependencies after transfer`);
      }

      // Step 3: Delete the duplicate restaurant
      console.log(`Deleting restaurant ${removeId}`);
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', removeId);

      if (deleteError) {
        console.error('Error deleting restaurant:', deleteError);
        throw new Error(`Failed to delete restaurant: ${deleteError.message}`);
      }

      // Step 4: Verify deletion
      const { data: verifyDelete } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', removeId)
        .limit(1);

      if (verifyDelete && verifyDelete.length > 0) {
        throw new Error(`Restaurant ${removeId} was not actually deleted`);
      }

      console.log(`Successfully removed duplicate restaurant ${removeId}`);

    } catch (error: any) {
      console.error(`Failed to remove restaurant ${removeId}:`, error);
      throw error;
    }
  }

  console.log(`Completed duplicate removal for ${removeIds.length} restaurants`);
};
