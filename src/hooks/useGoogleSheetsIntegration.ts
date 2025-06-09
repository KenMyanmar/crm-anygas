
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseGoogleSheetsUrl } from '@/utils/googleSheetsUtils';
import { importFromGoogleSheets } from '@/services/googleSheetsImport';
import { exportToGoogleSheets } from '@/services/googleSheetsExport';
import { ImportParams } from '@/types/googleSheets';

export const useGoogleSheetsIntegration = () => {
  const queryClient = useQueryClient();
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const importFromGoogleSheetsMutation = useMutation({
    mutationFn: async (params: ImportParams) => {
      setIsImporting(true);
      setImportProgress(0);

      try {
        const result = await importFromGoogleSheets(params, setImportProgress);
        return result;
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

  const exportToGoogleSheetsMutation = useMutation({
    mutationFn: exportToGoogleSheets,
    onSuccess: () => {
      toast.success('Plan exported successfully as CSV');
    },
  });

  return {
    importFromGoogleSheets: importFromGoogleSheetsMutation,
    exportToGoogleSheets: exportToGoogleSheetsMutation,
    importProgress,
    isImporting,
    parseGoogleSheetsUrl,
  };
};
