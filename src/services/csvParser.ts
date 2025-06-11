
import { GoogleSheetsImportData } from '@/types/googleSheets';

export const parseCsvToImportData = (csvText: string, defaultTownship: string): GoogleSheetsImportData[] => {
  console.log('Parsing CSV with default township:', defaultTownship);
  
  const lines = csvText.trim().split('\n');
  console.log('Total lines:', lines.length);
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  // Skip header row
  const dataRows = lines.slice(1);
  console.log('Data rows:', dataRows.length);
  
  const results: GoogleSheetsImportData[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i].trim();
    if (!row) continue; // Skip empty rows
    
    // Parse CSV row (handle quoted values)
    const columns = parseCSVRow(row);
    console.log(`Row ${i + 1} columns:`, columns);
    
    if (columns.length < 1 || !columns[0]?.trim()) {
      console.warn(`Row ${i + 1}: Missing restaurant name, skipping`);
      continue;
    }
    
    const restaurantData: GoogleSheetsImportData = {
      restaurant_name: columns[0]?.trim() || '',
      township: columns[1]?.trim() || defaultTownship,
      uco_status: normalizeUcoStatus(columns[2]?.trim() || 'not_assessed'),
      collection_priority: normalizePriority(columns[3]?.trim() || 'medium'),
      expected_volume_kg: columns[4] ? parseFloat(columns[4]) : undefined,
      route_sequence: columns[5] ? parseInt(columns[5]) : undefined,
      notes: columns[6]?.trim() || '',
    };
    
    console.log(`Parsed restaurant ${i + 1}:`, restaurantData);
    results.push(restaurantData);
  }
  
  console.log(`Successfully parsed ${results.length} restaurants`);
  return results;
};

function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result.map(field => field.replace(/^"|"$/g, '').trim());
}

function normalizeUcoStatus(status: string): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'have_uco':
    case 'have uco':
    case 'yes':
    case 'available':
      return 'have_uco';
    case 'no_uco_reuse_staff':
    case 'no uco reuse staff':
    case 'reuse':
      return 'no_uco_reuse_staff';
    case 'no_uco_not_ready':
    case 'no uco not ready':
    case 'not ready':
      return 'no_uco_not_ready';
    case 'shop_closed':
    case 'shop closed':
    case 'closed':
      return 'shop_closed';
    case 'not_assessed':
    case 'not assessed':
    case '':
    default:
      return 'not_assessed';
  }
}

function normalizePriority(priority: string): string {
  const normalized = priority.toLowerCase();
  switch (normalized) {
    case 'confirmed':
    case 'confirm':
      return 'confirmed';
    case 'high':
      return 'high';
    case 'medium':
    case 'med':
    case '':
    default:
      return 'medium';
    case 'low':
      return 'low';
    case 'skip':
      return 'skip';
  }
}
