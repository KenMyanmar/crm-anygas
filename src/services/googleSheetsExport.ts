
import { supabase } from '@/lib/supabase';

export const exportToGoogleSheets = async (planId: string): Promise<string> => {
  const { data: items, error } = await supabase
    .from('uco_collection_items')
    .select(`
      *,
      restaurant:restaurants(name, township, phone, contact_person)
    `)
    .eq('plan_id', planId)
    .order('route_sequence');

  if (error) throw error;

  // Convert to CSV format
  const headers = [
    'Restaurant Name',
    'Township', 
    'UCO Status',
    'Priority',
    'Expected Volume (kg)',
    'Actual Volume (kg)',
    'Route Sequence',
    'Contact Person',
    'Phone',
    'Notes'
  ];

  const csvRows = [
    headers.join(','),
    ...items.map(item => [
      `"${item.restaurant?.name || ''}"`,
      `"${item.restaurant?.township || ''}"`,
      `"${item.uco_status || ''}"`,
      `"${item.collection_priority || ''}"`,
      item.expected_volume_kg || '',
      item.actual_volume_kg || '',
      item.route_sequence || '',
      `"${item.restaurant?.contact_person || ''}"`,
      `"${item.restaurant?.phone || ''}"`,
      `"${item.driver_notes || ''}"`
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `uco_collection_plan_${planId.slice(0, 8)}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);

  return csvContent;
};
