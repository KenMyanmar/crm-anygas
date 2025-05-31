
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
}

export const importRestaurantsCSV = async (
  restaurants: any[],
  onProgress?: (progress: number) => void
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    imported: 0,
    duplicates: 0,
    errors: []
  };

  try {
    // Get default salesperson
    const { data: defaultUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'salesperson')
      .limit(1)
      .single();

    const defaultSalespersonId = defaultUser?.id;

    if (!defaultSalespersonId) {
      throw new Error('No salesperson found in the system');
    }

    // Get existing restaurants for duplicate check
    const { data: existingRestaurants } = await supabase
      .from('restaurants')
      .select('name, township, phone, contact_person');

    const existingSet = new Set(
      existingRestaurants?.map(r => 
        `${r.name.toLowerCase()}_${r.township?.toLowerCase() || ''}_${r.phone || ''}`
      ) || []
    );

    const toInsert = [];
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      if (onProgress) {
        onProgress(Math.round((i / restaurants.length) * 100));
      }

      // Validate required fields
      if (!restaurant.name?.trim()) {
        result.errors.push(`Row ${i + 1}: Missing restaurant name`);
        continue;
      }

      // Check for duplicates
      const key = `${restaurant.name.toLowerCase()}_${restaurant.township?.toLowerCase() || ''}_${restaurant.phone || ''}`;
      if (existingSet.has(key)) {
        result.duplicates++;
        continue;
      }

      toInsert.push({
        name: restaurant.name.trim(),
        township: restaurant.township?.trim() || null,
        address: restaurant.address?.trim() || null,
        phone: restaurant.phone?.trim() || null,
        contact_person: restaurant.contact_person?.trim() || null,
        remarks: restaurant.remarks?.trim() || null,
        salesperson_id: defaultSalespersonId,
      });

      existingSet.add(key); // Prevent duplicates within the import batch
    }

    // Batch insert
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('restaurants')
        .insert(toInsert);

      if (error) {
        throw error;
      }

      result.imported = toInsert.length;
    }

    // Log the import
    await supabase
      .from('migration_log')
      .insert({
        action: 'CSV_IMPORT',
        table_name: 'restaurants',
        record_count: result.imported,
        details: {
          total_processed: restaurants.length,
          imported: result.imported,
          duplicates: result.duplicates,
          errors: result.errors.length,
        },
      });

    if (onProgress) {
      onProgress(100);
    }

    return result;
  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
    return result;
  }
};
