
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { importRestaurantsCSV } from '@/utils/restaurantImportUtils';

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
}

const ImportRestaurants = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
          const restaurant: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
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
                restaurant.phone = value;
                break;
              case 'contact_person':
              case 'contact_name':
                restaurant.contact_person = value;
                break;
              case 'remarks':
              case 'notes':
                restaurant.remarks = value;
                break;
            }
          });
          
          return restaurant;
        }).filter(r => r.name);

        setCsvData(parsedData);
        
        toast({
          title: "File Uploaded",
          description: `Successfully parsed ${parsedData.length} restaurants`,
        });
      } catch (error: any) {
        toast({
          title: "Parse Error",
          description: `Failed to parse CSV file: ${error.message}`,
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      const result = await importRestaurantsCSV(csvData, (progress) => {
        setProgress(progress);
      });
      
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported} restaurants. ${result.duplicates} duplicates skipped.`,
        });
        
        // Reset form
        setCsvData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast({
          title: "Import Failed",
          description: "Some restaurants failed to import. Check the results below.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Restaurants from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Expected columns: name, township, address, phone, contact_person, remarks
            </p>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Preview: {csvData.length} restaurants</span>
                </div>
                <div className="max-h-32 overflow-auto text-sm">
                  {csvData.slice(0, 3).map((restaurant, index) => (
                    <div key={index} className="mb-1">
                      {restaurant.name} - {restaurant.township || 'No township'}
                    </div>
                  ))}
                  {csvData.length > 3 && <div>... and {csvData.length - 3} more</div>}
                </div>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing restaurants...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Importing...' : 'Import Restaurants'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</div>
                <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Errors:</h4>
                <div className="max-h-32 overflow-auto text-sm text-red-600">
                  {importResult.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportRestaurants;
