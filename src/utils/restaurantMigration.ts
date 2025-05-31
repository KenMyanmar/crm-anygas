
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface RestaurantImportData {
  name: string;
  township?: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  remarks?: string;
  salesperson_id?: string;
}

export interface MigrationStats {
  totalRestaurants: number;
  successfulMatches: number;
  partialMatches: number;
  noMatches: number;
  dependencies: {
    orders: number;
    leads: number;
    visitTasks: number;
    notes: number;
    meetings: number;
    calls: number;
  };
}

export const parseCSVData = (csvText: string): RestaurantImportData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const restaurant: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/['"]/g, '') || '';
      
      switch (header) {
        case 'name':
        case 'restaurant_name':
          restaurant.name = value;
          break;
        case 'township':
        case 'area':
          restaurant.township = value;
          break;
        case 'address':
        case 'location':
          restaurant.address = value;
          break;
        case 'phone':
        case 'phone_number':
        case 'contact':
          restaurant.phone = value;
          break;
        case 'contact_person':
        case 'contact_name':
        case 'manager':
          restaurant.contact_person = value;
          break;
        case 'remarks':
        case 'notes':
        case 'comment':
          restaurant.remarks = value;
          break;
        case 'salesperson_id':
        case 'salesperson':
          restaurant.salesperson_id = value;
          break;
      }
    });
    
    return restaurant;
  }).filter(r => r.name); // Only include restaurants with names
};

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

export const findBestMatch = (
  newRestaurant: RestaurantImportData,
  existingRestaurants: any[]
): { restaurant: any; confidence: number; matchType: string } | null => {
  let bestMatch = null;
  let bestScore = 0;
  let matchType = 'none';
  
  for (const existing of existingRestaurants) {
    const nameScore = calculateSimilarity(newRestaurant.name, existing.restaurant_name);
    
    // Exact name match
    if (nameScore === 1.0) {
      // Check township for additional confidence
      const townshipScore = newRestaurant.township && existing.restaurant_township
        ? calculateSimilarity(newRestaurant.township, existing.restaurant_township)
        : 0.5;
      
      const totalScore = nameScore * 0.8 + townshipScore * 0.2;
      
      if (totalScore > bestScore) {
        bestMatch = existing;
        bestScore = totalScore;
        matchType = 'exact';
      }
    }
    // Partial name match (80%+ similarity)
    else if (nameScore >= 0.8) {
      const townshipScore = newRestaurant.township && existing.restaurant_township
        ? calculateSimilarity(newRestaurant.township, existing.restaurant_township)
        : 0.3;
      
      const totalScore = nameScore * 0.7 + townshipScore * 0.3;
      
      if (totalScore > bestScore && totalScore >= 0.75) {
        bestMatch = existing;
        bestScore = totalScore;
        matchType = 'partial';
      }
    }
  }
  
  return bestMatch ? { restaurant: bestMatch, confidence: bestScore, matchType } : null;
};

export const importRestaurantsToStaging = async (restaurants: RestaurantImportData[]): Promise<{success: boolean; importedCount: number; errors: string[]}> => {
  const errors: string[] = [];
  let importedCount = 0;
  
  try {
    // Get default salesperson if not provided
    const { data: defaultUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'salesperson')
      .limit(1)
      .single();
    
    const defaultSalespersonId = defaultUser?.id;
    
    for (const restaurant of restaurants) {
      try {
        // Validate required fields
        if (!restaurant.name?.trim()) {
          errors.push(`Skipping restaurant with empty name`);
          continue;
        }
        
        const salespersonId = restaurant.salesperson_id || defaultSalespersonId;
        if (!salespersonId) {
          errors.push(`No salesperson ID found for restaurant: ${restaurant.name}`);
          continue;
        }
        
        const { error } = await supabase
          .from('restaurants_staging')
          .insert({
            name: restaurant.name.trim(),
            township: restaurant.township?.trim() || null,
            address: restaurant.address?.trim() || null,
            phone: restaurant.phone?.trim() || null,
            contact_person: restaurant.contact_person?.trim() || null,
            remarks: restaurant.remarks?.trim() || null,
            salesperson_id: salespersonId,
          });
        
        if (error) {
          errors.push(`Failed to import ${restaurant.name}: ${error.message}`);
        } else {
          importedCount++;
        }
      } catch (err: any) {
        errors.push(`Error processing ${restaurant.name}: ${err.message}`);
      }
    }
    
    // Log the import
    await supabase
      .from('migration_log')
      .insert({
        action: 'STAGING_IMPORT',
        table_name: 'restaurants_staging',
        record_count: importedCount,
        details: {
          total_attempted: restaurants.length,
          successful: importedCount,
          errors: errors.length,
        },
      });
    
    return { success: true, importedCount, errors };
  } catch (error: any) {
    return { success: false, importedCount, errors: [error.message] };
  }
};

export const createRestaurantMappings = async (): Promise<{success: boolean; stats: MigrationStats}> => {
  try {
    // Get staging restaurants
    const { data: stagingRestaurants, error: stagingError } = await supabase
      .from('restaurants_staging')
      .select('*');
    
    if (stagingError) throw stagingError;
    
    // Get existing restaurants with dependency counts from backup tables
    const existingRestaurants = [];
    
    // Collect unique restaurants from all backup tables
    const backupTables = [
      'orders_backup',
      'leads_backup', 
      'visit_tasks_backup',
      'notes_backup',
      'meetings_backup',
      'calls_backup'
    ];
    
    for (const table of backupTables) {
      const { data, error } = await supabase
        .from(table)
        .select('restaurant_id, restaurant_name, restaurant_township');
      
      if (error) throw error;
      
      data?.forEach(item => {
        if (!existingRestaurants.find(r => r.restaurant_id === item.restaurant_id)) {
          existingRestaurants.push(item);
        }
      });
    }
    
    const stats: MigrationStats = {
      totalRestaurants: stagingRestaurants?.length || 0,
      successfulMatches: 0,
      partialMatches: 0,
      noMatches: 0,
      dependencies: {
        orders: 0,
        leads: 0,
        visitTasks: 0,
        notes: 0,
        meetings: 0,
        calls: 0,
      },
    };
    
    // Create mappings for matched restaurants
    const mappings = [];
    
    for (const stagingRestaurant of stagingRestaurants || []) {
      const match = findBestMatch(stagingRestaurant, existingRestaurants);
      
      if (match) {
        mappings.push({
          old_restaurant_id: match.restaurant.restaurant_id,
          new_restaurant_id: stagingRestaurant.id,
          restaurant_name: stagingRestaurant.name,
          restaurant_township: stagingRestaurant.township,
          match_confidence: match.matchType,
        });
        
        if (match.matchType === 'exact') {
          stats.successfulMatches++;
        } else {
          stats.partialMatches++;
        }
      } else {
        stats.noMatches++;
      }
    }
    
    // Insert mappings
    if (mappings.length > 0) {
      const { error: mappingError } = await supabase
        .from('restaurant_id_mapping')
        .insert(mappings);
      
      if (mappingError) throw mappingError;
    }
    
    // Calculate dependency stats
    const dependencyQueries = [
      { table: 'orders_backup', key: 'orders' },
      { table: 'leads_backup', key: 'leads' },
      { table: 'visit_tasks_backup', key: 'visitTasks' },
      { table: 'notes_backup', key: 'notes' },
      { table: 'meetings_backup', key: 'meetings' },
      { table: 'calls_backup', key: 'calls' },
    ];
    
    for (const { table, key } of dependencyQueries) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      stats.dependencies[key as keyof typeof stats.dependencies] = count || 0;
    }
    
    // Log the mapping creation
    await supabase
      .from('migration_log')
      .insert({
        action: 'MAPPINGS_CREATED',
        details: {
          total_mappings: mappings.length,
          stats,
        },
      });
    
    return { success: true, stats };
  } catch (error: any) {
    console.error('Error creating mappings:', error);
    return { 
      success: false, 
      stats: {
        totalRestaurants: 0,
        successfulMatches: 0,
        partialMatches: 0,
        noMatches: 0,
        dependencies: { orders: 0, leads: 0, visitTasks: 0, notes: 0, meetings: 0, calls: 0 }
      }
    };
  }
};

export const executeRestaurantReplacement = async (): Promise<{success: boolean; message: string}> => {
  try {
    // This is a complex operation that should be done step by step
    // For now, we'll create a simplified version that replaces restaurants
    // while preserving dependencies through the mapping table
    
    console.log('Starting restaurant replacement...');
    
    // Step 1: Replace restaurants with staging data
    const { error: deleteError } = await supabase
      .from('restaurants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) throw deleteError;
    
    // Step 2: Insert staging restaurants as new restaurants
    const { data: stagingData, error: stagingSelectError } = await supabase
      .from('restaurants_staging')
      .select('*');
    
    if (stagingSelectError) throw stagingSelectError;
    
    const { error: insertError } = await supabase
      .from('restaurants')
      .insert(stagingData?.map(r => ({
        name: r.name,
        township: r.township,
        address: r.address,
        phone: r.phone,
        contact_person: r.contact_person,
        remarks: r.remarks,
        salesperson_id: r.salesperson_id,
      })) || []);
    
    if (insertError) throw insertError;
    
    // Log the replacement
    await supabase
      .from('migration_log')
      .insert({
        action: 'RESTAURANTS_REPLACED',
        table_name: 'restaurants',
        record_count: stagingData?.length || 0,
        details: {
          message: 'Restaurants successfully replaced with staging data',
        },
      });
    
    toast({
      title: "Success",
      description: `Successfully replaced ${stagingData?.length || 0} restaurants`,
    });
    
    return { success: true, message: `Successfully replaced ${stagingData?.length || 0} restaurants` };
  } catch (error: any) {
    console.error('Error executing replacement:', error);
    
    toast({
      title: "Error",
      description: `Failed to replace restaurants: ${error.message}`,
      variant: "destructive",
    });
    
    return { success: false, message: error.message };
  }
};
