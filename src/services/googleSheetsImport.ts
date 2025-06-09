
import { supabase } from '@/lib/supabase';
import { GoogleSheetsImportData, ImportParams, ImportResult } from '@/types/googleSheets';
import { parseCsvToImportData } from './csvParser';
import { createCsvUrl, parseGoogleSheetsUrl } from '@/utils/googleSheetsUtils';

export const importFromGoogleSheets = async (
  params: ImportParams,
  onProgress: (progress: number) => void
): Promise<ImportResult> => {
  const { sheetsUrl, planName, township } = params;
  
  const sheetId = parseGoogleSheetsUrl(sheetsUrl);
  if (!sheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  const csvUrl = createCsvUrl(sheetId);
  
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch spreadsheet data');
  }
  
  const csvText = await response.text();
  onProgress(25);

  const importData = parseCsvToImportData(csvText, township);
  onProgress(50);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create UCO collection plan
  const { data: plan, error: planError } = await supabase
    .from('uco_collection_plans')
    .insert({
      plan_name: planName,
      township: township,
      plan_date: new Date().toISOString().split('T')[0],
      created_by: user.id,
    })
    .select()
    .single();

  if (planError) throw planError;
  onProgress(75);

  // Match restaurants and create collection items
  const collectionItems = [];
  for (const item of importData) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .ilike('name', `%${item.restaurant_name}%`)
      .eq('township', item.township)
      .limit(1)
      .single();

    if (restaurant) {
      collectionItems.push({
        plan_id: plan.id,
        restaurant_id: restaurant.id,
        route_sequence: item.route_sequence || collectionItems.length + 1,
        uco_status: item.uco_status,
        collection_priority: item.collection_priority,
        expected_volume_kg: item.expected_volume_kg,
      });
    }
  }

  // Bulk insert collection items
  if (collectionItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('uco_collection_items')
      .insert(collectionItems);

    if (itemsError) throw itemsError;
  }

  onProgress(100);
  return { plan, importedCount: collectionItems.length };
};
