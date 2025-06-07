
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface GoogleSheetsImportData {
  restaurant_name: string;
  township: string;
  uco_status: string;
  collection_priority: string;
  expected_volume_kg?: number;
  route_sequence?: number;
  notes?: string;
}

export const useGoogleSheetsIntegration = () => {
  const queryClient = useQueryClient();
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const parseGoogleSheetsUrl = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const importFromGoogleSheets = useMutation({
    mutationFn: async ({ sheetsUrl, planName, township }: { 
      sheetsUrl: string; 
      planName: string; 
      township: string; 
    }) => {
      setIsImporting(true);
      setImportProgress(0);

      const sheetId = parseGoogleSheetsUrl(sheetsUrl);
      if (!sheetId) {
        throw new Error('Invalid Google Sheets URL');
      }

      // Convert to CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch spreadsheet data');
        }
        
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header row
        
        setImportProgress(25);

        // Parse CSV data
        const importData: GoogleSheetsImportData[] = rows
          .filter(row => row.trim())
          .map(row => {
            const columns = row.split(',').map(col => col.replace(/"/g, '').trim());
            return {
              restaurant_name: columns[0] || '',
              township: columns[1] || township,
              uco_status: columns[2] || 'not_assessed',
              collection_priority: columns[3] || 'medium',
              expected_volume_kg: columns[4] ? parseFloat(columns[4]) : undefined,
              route_sequence: columns[5] ? parseInt(columns[5]) : undefined,
              notes: columns[6] || '',
            };
          });

        setImportProgress(50);

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

        setImportProgress(75);

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

        setImportProgress(100);
        return { plan, importedCount: collectionItems.length };

      } catch (error) {
        throw error;
      } finally {
        setIsImporting(false);
        setImportProgress(0);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uco-collection-plans'] });
      toast.success(`Successfully imported ${data.importedCount} restaurants from Google Sheets`);
    },
    onError: (error: any) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const exportToGoogleSheets = useMutation({
    mutationFn: async (planId: string) => {
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
    },
    onSuccess: () => {
      toast.success('Plan exported successfully as CSV');
    },
  });

  return {
    importFromGoogleSheets,
    exportToGoogleSheets,
    importProgress,
    isImporting,
    parseGoogleSheetsUrl,
  };
};
