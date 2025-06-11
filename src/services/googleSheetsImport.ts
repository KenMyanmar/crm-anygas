
import { supabase } from '@/lib/supabase';
import { GoogleSheetsImportData, ImportParams, ImportResult } from '@/types/googleSheets';
import { parseCsvToImportData } from './csvParser';
import { createCsvUrl, parseGoogleSheetsUrl } from '@/utils/googleSheetsUtils';

export const importFromGoogleSheets = async (
  params: ImportParams,
  onProgress: (progress: number) => void
): Promise<ImportResult> => {
  const { sheetsUrl, planName, township } = params;
  
  console.log('Starting Google Sheets import:', params);
  
  const sheetId = parseGoogleSheetsUrl(sheetsUrl);
  if (!sheetId) {
    throw new Error('Invalid Google Sheets URL. Please make sure you copied the full URL from your browser.');
  }

  console.log('Extracted sheet ID:', sheetId);
  const csvUrl = createCsvUrl(sheetId);
  console.log('CSV URL:', csvUrl);
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Cannot access the Google Sheet. Please make sure it is publicly viewable (Anyone with link can view).');
      }
      throw new Error(`Failed to fetch spreadsheet data: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV text length:', csvText.length);
    console.log('First 200 chars of CSV:', csvText.substring(0, 200));
    
    if (!csvText.trim()) {
      throw new Error('The Google Sheet appears to be empty.');
    }
    
    onProgress(25);

    const importData = parseCsvToImportData(csvText, township);
    console.log('Parsed import data:', importData);
    
    if (importData.length === 0) {
      throw new Error('No valid data found in the spreadsheet. Please check the format.');
    }
    
    onProgress(50);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create UCO collection plan
    const { data: plan, error: planError } = await supabase
      .from('uco_collection_plans')
      .insert({
        plan_name: planName,
        townships: [township],
        township: township, // For backward compatibility
        plan_date: new Date().toISOString().split('T')[0],
        truck_capacity_kg: 500, // Default capacity
        created_by: user.id,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating plan:', planError);
      throw new Error(`Failed to create collection plan: ${planError.message}`);
    }
    
    console.log('Created plan:', plan);
    onProgress(75);

    // Match restaurants and create collection items
    const collectionItems = [];
    let matchedCount = 0;
    
    for (const item of importData) {
      console.log(`Looking for restaurant: ${item.restaurant_name} in ${item.township}`);
      
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .ilike('name', `%${item.restaurant_name}%`)
        .eq('township', item.township)
        .limit(1)
        .single();

      if (restaurant) {
        matchedCount++;
        collectionItems.push({
          plan_id: plan.id,
          restaurant_id: restaurant.id,
          route_sequence: item.route_sequence || collectionItems.length + 1,
          uco_status: item.uco_status as any,
          collection_priority: item.collection_priority as any,
          expected_volume_kg: item.expected_volume_kg,
        });
        console.log(`Matched restaurant: ${item.restaurant_name}`);
      } else {
        console.log(`No match found for restaurant: ${item.restaurant_name} in ${item.township}`);
      }
    }

    console.log(`Matched ${matchedCount} out of ${importData.length} restaurants`);

    // Bulk insert collection items
    if (collectionItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('uco_collection_items')
        .insert(collectionItems);

      if (itemsError) {
        console.error('Error inserting collection items:', itemsError);
        throw new Error(`Failed to add restaurants to plan: ${itemsError.message}`);
      }
      
      console.log(`Successfully inserted ${collectionItems.length} collection items`);
    }

    onProgress(100);
    
    const result = { 
      plan, 
      importedCount: collectionItems.length,
      totalRows: importData.length,
      matchedRestaurants: matchedCount
    };
    
    console.log('Import completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
