
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

  // Improved CSV parsing function to handle comma-separated values properly
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  // Improved header mapping function
  const mapHeaderToField = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().trim().replace(/['"]/g, '');
    
    console.log(`Mapping header: "${header}" -> normalized: "${normalizedHeader}"`);
    
    // Map common variations to our field names
    const headerMappings: { [key: string]: string } = {
      'name': 'name',
      'restaurant': 'name',
      'restaurant name': 'name',
      'restaurant_name': 'name',
      'township': 'township',
      'area': 'township',
      'region': 'township',
      'address': 'address',
      'location': 'address',
      'phone': 'phone',
      'phone number': 'phone',
      'telephone': 'phone',
      'contact person': 'contact_person',
      'contact_person': 'contact_person',
      'contact': 'contact_person',
      'person': 'contact_person',
      'remarks': 'remarks',
      'notes': 'remarks',
      'comment': 'remarks'
    };

    const mappedField = headerMappings[normalizedHeader];
    console.log(`Header "${header}" mapped to field: "${mappedField}"`);
    return mappedField || null;
  };

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
        const lines = csvText.trim().split('\n').map(line => line.trim()).filter(line => line);
        
        console.log('Total lines found:', lines.length);
        console.log('First few lines:', lines.slice(0, 3));
        
        if (lines.length < 2) {
          toast({
            title: "No Data",
            description: "CSV file must contain at least a header and one data row",
            variant: "destructive",
          });
          return;
        }

        // Parse headers using proper CSV parsing
        const headers = parseCSVLine(lines[0]);
        console.log('Raw CSV Headers:', headers);
        
        // Create header mapping
        const headerMap: { [index: number]: string } = {};
        const mappedFields: string[] = [];
        
        headers.forEach((header, index) => {
          const fieldName = mapHeaderToField(header);
          if (fieldName) {
            headerMap[index] = fieldName;
            mappedFields.push(`${header} -> ${fieldName}`);
          }
        });
        
        console.log('Header mapping:', headerMap);
        console.log('Mapped fields:', mappedFields);
        
        // Validate that we have at least the name field
        const hasName = Object.values(headerMap).includes('name');
        if (!hasName) {
          console.error('No name field found. Available headers:', headers);
          toast({
            title: "Missing Required Field",
            description: `CSV must contain a 'Name' or 'Restaurant' column. Found headers: ${headers.join(', ')}`,
            variant: "destructive",
          });
          return;
        }

        const parsedData = [];
        
        // Parse data rows using proper CSV parsing
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue; // Skip empty lines
          
          const values = parseCSVLine(line);
          console.log(`Row ${i} parsed values:`, values);
          
          if (values.length < headers.length) {
            console.warn(`Row ${i} has ${values.length} values but ${headers.length} headers`);
          }
          
          const restaurant: any = {};
          
          // Map values using our header mapping
          Object.entries(headerMap).forEach(([index, fieldName]) => {
            const value = values[parseInt(index)];
            if (value && value.trim()) {
              restaurant[fieldName] = value.trim();
            }
          });
          
          console.log(`Parsed restaurant ${i}:`, restaurant);
          
          // Only add restaurants with names
          if (restaurant.name && restaurant.name.trim()) {
            parsedData.push(restaurant);
          } else {
            console.warn(`Row ${i} missing name:`, restaurant);
          }
        }

        console.log('Final parsed data:', parsedData);
        setCsvData(parsedData);
        
        if (parsedData.length === 0) {
          toast({
            title: "No Valid Data",
            description: "No restaurants with valid names found in the CSV file",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "File Uploaded",
          description: `Successfully parsed ${parsedData.length} restaurants`,
        });
      } catch (error: any) {
        console.error('CSV parsing error:', error);
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
              Expected columns: Name, Township, Address, Phone, Contact Person (comma-separated)
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
                      <strong>{restaurant.name}</strong> - {restaurant.township || 'No township'} - 
                      Phone: {restaurant.phone || 'No phone'} - 
                      Contact: {restaurant.contact_person || 'No contact'}
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
