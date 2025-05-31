
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

        exactDuplicateCount += group.length - 1; // Count duplicates to be removed
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
        // Group by unique phone numbers to show these are likely chains
        const phoneGroups = new Map<string, any[]>();
        for (const restaurant of group) {
          const phoneKey = normalizePhone(restaurant.phone);
          if (!phoneGroups.has(phoneKey)) {
            phoneGroups.set(phoneKey, []);
          }
          phoneGroups.get(phoneKey)!.push(restaurant);
        }

        // Only show as similar if there are multiple unique phone numbers
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
    const totalGroups = exactGroups.length;

    // Process each exact duplicate group
    for (let i = 0; i < exactGroups.length; i++) {
      const group = exactGroups[i];
      const keepId = group.restaurants[0].id; // Keep the first (most complete) record
      const removeIds = group.restaurants.slice(1).map(r => r.id);

      if (onProgress) {
        const progress = 20 + ((i / totalGroups) * 70);
        onProgress(progress, `Processing group ${i + 1}/${totalGroups}...`);
      }

      // Transfer dependencies and remove duplicates
      await removeDuplicateRestaurant(keepId, removeIds);
      totalRemoved += removeIds.length;
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
          auto_processed: true,
        },
      });

    if (onProgress) onProgress(100, 'Complete!');

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
  try {
    // Transfer all related records to the kept restaurant
    for (const removeId of removeIds) {
      await Promise.all([
        // Update orders
        supabase
          .from('orders')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
        
        // Update leads
        supabase
          .from('leads')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
          
        // Update visit tasks
        supabase
          .from('visit_tasks')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
          
        // Update meetings
        supabase
          .from('meetings')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
          
        // Update calls
        supabase
          .from('calls')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
          
        // Update notes
        supabase
          .from('notes')
          .update({ target_id: keepId })
          .eq('target_id', removeId)
          .eq('target_type', 'RESTAURANT'),
          
        // Update voice notes
        supabase
          .from('voice_notes')
          .update({ restaurant_id: keepId })
          .eq('restaurant_id', removeId),
      ]);
    }

    // Delete the duplicate restaurants
    const { error: deleteError } = await supabase
      .from('restaurants')
      .delete()
      .in('id', removeIds);

    if (deleteError) throw deleteError;

  } catch (error: any) {
    console.error('Error removing duplicates:', error);
    throw error;
  }
};
