
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Upload, ExternalLink, CheckCircle } from 'lucide-react';
import { useGoogleSheetsIntegration } from '@/hooks/useGoogleSheetsIntegration';

interface GoogleSheetsImporterProps {
  onImportComplete?: (planId: string) => void;
}

export const GoogleSheetsImporter: React.FC<GoogleSheetsImporterProps> = ({ 
  onImportComplete 
}) => {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [planName, setPlanName] = useState('');
  const [township, setTownship] = useState('');
  
  const { 
    importFromGoogleSheets, 
    importProgress, 
    isImporting, 
    parseGoogleSheetsUrl 
  } = useGoogleSheetsIntegration();

  const isValidUrl = sheetsUrl && parseGoogleSheetsUrl(sheetsUrl);

  const handleImport = async () => {
    if (!isValidUrl || !planName || !township) {
      console.error('Missing required fields:', { isValidUrl, planName, township });
      return;
    }

    console.log('Starting Google Sheets import with:', { sheetsUrl, planName, township });

    try {
      const result = await importFromGoogleSheets.mutateAsync({
        sheetsUrl,
        planName,
        township,
      });
      
      console.log('Import successful:', result);
      
      if (onImportComplete && result.plan) {
        onImportComplete(result.plan.id);
      }
      
      // Reset form
      setSheetsUrl('');
      setPlanName('');
      setTownship('');
    } catch (error) {
      console.error('Import failed with error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <span>Import from Google Sheets</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Required format:</strong> Restaurant Name, Township, UCO Status, Priority, Expected Volume, Route Sequence, Notes
            <br />
            <strong>Example:</strong> Restaurant ABC, Yankin, have_uco, high, 25, 1, Good quality supplier
            <br />
            <strong>Important:</strong> Make sure your Google Sheet is publicly viewable (Anyone with link can view)
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="sheets-url">Google Sheets URL</Label>
            <Input
              id="sheets-url"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className={isValidUrl ? 'border-green-500' : ''}
            />
            {isValidUrl && (
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid Google Sheets URL detected
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Yankin Township Collection"
              />
            </div>
            <div>
              <Label htmlFor="township">Default Township</Label>
              <Input
                id="township"
                value={township}
                onChange={(e) => setTownship(e.target.value)}
                placeholder="e.g., Yankin"
              />
            </div>
          </div>
        </div>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing data...</span>
              <span>{importProgress}%</span>
            </div>
            <Progress value={importProgress} />
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!isValidUrl || !planName || !township || isImporting}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Importing...' : 'Import from Google Sheets'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>1. Make sure your Google Sheet is publicly viewable (Anyone with link can view)</p>
          <p>2. First row should contain headers</p>
          <p>3. Restaurants will be matched by name and township</p>
          <p>4. If restaurants don't exist in the system, they won't be imported</p>
        </div>
      </CardContent>
    </Card>
  );
};
