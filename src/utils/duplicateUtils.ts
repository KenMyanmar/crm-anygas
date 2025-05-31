
import { supabase } from '@/lib/supabase';

export interface DuplicateGroup {
  id: string;
  restaurants: any[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Simple Levenshtein distance calculation
  const matrix = [];
  const len1 = s1.length;
  const len2 = s2.length;
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return 1 - matrix[len2][len1] / maxLen;
};

export const findDuplicateRestaurants = async (): Promise<DuplicateGroup[]> => {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < restaurants.length; i++) {
      const restaurant1 = restaurants[i];
      
      if (processed.has(restaurant1.id)) continue;

      const group: any[] = [restaurant1];
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let reason = '';

      for (let j = i + 1; j < restaurants.length; j++) {
        const restaurant2 = restaurants[j];
        
        if (processed.has(restaurant2.id)) continue;

        // Exact name match
        if (restaurant1.name.toLowerCase().trim() === restaurant2.name.toLowerCase().trim()) {
          group.push(restaurant2);
          confidence = 'high';
          reason = 'Exact name match';
          processed.add(restaurant2.id);
          continue;
        }

        // Similar name with same township
        const nameSimilarity = calculateSimilarity(restaurant1.name, restaurant2.name);
        const sameTownship = restaurant1.township && restaurant2.township && 
          restaurant1.township.toLowerCase() === restaurant2.township.toLowerCase();

        if (nameSimilarity >= 0.8 && sameTownship) {
          group.push(restaurant2);
          confidence = confidence === 'low' ? 'medium' : confidence;
          reason = 'Similar name + same township';
          processed.add(restaurant2.id);
          continue;
        }

        // Same phone number
        if (restaurant1.phone && restaurant2.phone && 
            restaurant1.phone.replace(/\s/g, '') === restaurant2.phone.replace(/\s/g, '')) {
          group.push(restaurant2);
          confidence = 'high';
          reason = 'Same phone number';
          processed.add(restaurant2.id);
          continue;
        }

        // High name similarity
        if (nameSimilarity >= 0.9) {
          group.push(restaurant2);
          confidence = confidence === 'low' ? 'medium' : confidence;
          reason = 'Very similar names';
          processed.add(restaurant2.id);
        }
      }

      if (group.length > 1) {
        // Sort by completeness (most complete record first)
        group.sort((a, b) => {
          const scoreA = [a.township, a.address, a.phone, a.contact_person].filter(Boolean).length;
          const scoreB = [b.township, b.address, b.phone, b.contact_person].filter(Boolean).length;
          return scoreB - scoreA;
        });

        duplicateGroups.push({
          id: `group_${duplicateGroups.length}`,
          restaurants: group,
          confidence,
          reason,
        });

        group.forEach(r => processed.add(r.id));
      }
    }

    return duplicateGroups;
  } catch (error: any) {
    console.error('Error finding duplicates:', error);
    throw error;
  }
};

export const removeDuplicateRestaurant = async (keepId: string, removeIds: string[]) => {
  try {
    // Start a transaction-like operation
    for (const removeId of removeIds) {
      // Update all related records to point to the kept restaurant
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

    // Log the operation
    await supabase
      .from('migration_log')
      .insert({
        action: 'DELETE_DUPLICATES',
        table_name: 'restaurants',
        record_count: removeIds.length,
        details: {
          kept_restaurant_id: keepId,
          removed_restaurant_ids: removeIds,
        },
      });

  } catch (error: any) {
    console.error('Error removing duplicates:', error);
    throw error;
  }
};
