
import { GoogleSheetsImportData } from '@/types/googleSheets';

export const parseCsvToImportData = (csvText: string, defaultTownship: string): GoogleSheetsImportData[] => {
  const rows = csvText.split('\n').slice(1); // Skip header row
  
  return rows
    .filter(row => row.trim())
    .map(row => {
      const columns = row.split(',').map(col => col.replace(/"/g, '').trim());
      return {
        restaurant_name: columns[0] || '',
        township: columns[1] || defaultTownship,
        uco_status: columns[2] || 'not_assessed',
        collection_priority: columns[3] || 'medium',
        expected_volume_kg: columns[4] ? parseFloat(columns[4]) : undefined,
        route_sequence: columns[5] ? parseInt(columns[5]) : undefined,
        notes: columns[6] || '',
      };
    });
};
