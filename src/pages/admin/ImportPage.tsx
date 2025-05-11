
import { useState, useRef, ChangeEvent } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface CSVColumnMapping {
  csvColumn: string;
  dbField: string;
  required: boolean;
  example?: string;
}

const ImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mappings, setMappings] = useState<CSVColumnMapping[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importResults, setImportResults] = useState<{
    total: number;
    created: number;
    errors: number;
    messages: string[];
  }>({ total: 0, created: 0, errors: 0, messages: [] });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Default mappings for typical restaurant data fields
  const availableDbFields = [
    { value: 'name', label: 'Restaurant Name', required: true },
    { value: 'township', label: 'Township', required: false },
    { value: 'address', label: 'Address', required: false },
    { value: 'phone_primary', label: 'Primary Phone', required: true },
    { value: 'phone_secondary', label: 'Secondary Phone', required: false },
    { value: 'contact_person_name', label: 'Contact Person', required: false },
    { value: 'notes', label: 'Notes', required: false },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportStatus('idle');
    setImportResults({ total: 0, created: 0, errors: 0, messages: [] });

    // Parse the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const csvContent = event.target.result as string;
      const rows = csvContent.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "The CSV file must contain at least a header row and one data row",
          variant: "destructive",
        });
        return;
      }
      
      // Extract headers and create initial mappings
      const headers = rows[0].split(',').map(header => header.trim());
      setCsvHeaders(headers);
      
      // Sample data (up to first 5 rows)
      const dataRows = rows.slice(1, Math.min(6, rows.length))
        .map(row => row.split(',').map(cell => cell.trim()));
      setCsvData(dataRows);

      // Create initial mappings by trying to match headers to db fields
      const initialMappings: CSVColumnMapping[] = [];
      
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        const matchedField = availableDbFields.find(field => {
          const fieldName = field.label.toLowerCase();
          return lowerHeader.includes(fieldName) || fieldName.includes(lowerHeader);
        });
        
        if (matchedField) {
          initialMappings.push({
            csvColumn: header,
            dbField: matchedField.value,
            required: matchedField.required,
            example: dataRows.length > 0 ? dataRows[0][headers.indexOf(header)] : undefined
          });
        } else {
          initialMappings.push({
            csvColumn: header,
            dbField: '',
            required: false,
            example: dataRows.length > 0 ? dataRows[0][headers.indexOf(header)] : undefined
          });
        }
      });
      
      setMappings(initialMappings);
    };
    
    reader.readAsText(selectedFile);
  };

  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setMappings(prevMappings =>
      prevMappings.map(mapping =>
        mapping.csvColumn === csvColumn
          ? {
              ...mapping,
              dbField,
              required: availableDbFields.find(field => field.value === dbField)?.required || false
            }
          : mapping
      )
    );
  };

  const isValidMapping = () => {
    // Check if all required fields are mapped
    const requiredFields = ['name', 'phone_primary'];
    const mappedFields = mappings.map(m => m.dbField);
    return requiredFields.every(field => mappedFields.includes(field));
  };

  const handleImport = async () => {
    if (!isValidMapping()) {
      toast({
        title: "Invalid Mapping",
        description: "Please map all required fields (Restaurant Name and Primary Phone)",
        variant: "destructive",
      });
      return;
    }

    if (!file) return;

    setImportStatus('loading');
    setImportResults({ total: 0, created: 0, errors: 0, messages: [] });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        const csvContent = event.target.result as string;
        const rows = csvContent.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(header => header.trim());
        const dataRows = rows.slice(1).map(row => row.split(',').map(cell => cell.trim()));
        
        let totalProcessed = 0;
        let successCount = 0;
        let errorCount = 0;
        const messages: string[] = [];

        // Process each row
        for (const row of dataRows) {
          try {
            if (row.length < headers.length || !row[0]) continue; // Skip empty rows
            
            totalProcessed++;
            
            // Create restaurant data object based on mappings
            const restaurantData: Record<string, string> = {};
            mappings.forEach(mapping => {
              if (mapping.dbField && mapping.csvColumn) {
                const columnIndex = headers.indexOf(mapping.csvColumn);
                if (columnIndex !== -1 && row[columnIndex]) {
                  restaurantData[mapping.dbField] = row[columnIndex];
                }
              }
            });
            
            // Skip if missing required fields
            if (!restaurantData.name || !restaurantData.phone_primary) {
              errorCount++;
              messages.push(`Row ${totalProcessed}: Skipped due to missing required fields`);
              continue;
            }
            
            // Check if the restaurant already exists by phone_primary
            const { data: existingRestaurant, error: findError } = await supabase
              .from('restaurants')
              .select('id')
              .eq('phone_primary', restaurantData.phone_primary)
              .limit(1);
              
            if (findError) throw findError;
            
            let restaurantId;
            
            if (existingRestaurant && existingRestaurant.length > 0) {
              // Restaurant exists, use its ID
              restaurantId = existingRestaurant[0].id;
              messages.push(`Row ${totalProcessed}: Restaurant with phone ${restaurantData.phone_primary} already exists, creating lead`);
            } else {
              // Create new restaurant
              const { data: newRestaurant, error: insertError } = await supabase
                .from('restaurants')
                .insert({
                  ...restaurantData,
                  created_by_user_id: profile?.id
                })
                .select('id');
                
              if (insertError) throw insertError;
              
              restaurantId = newRestaurant?.[0]?.id;
              messages.push(`Row ${totalProcessed}: Created new restaurant "${restaurantData.name}"`);
            }
            
            if (!restaurantId) {
              throw new Error('Failed to get restaurant ID');
            }
            
            // Create a new lead
            const { error: leadError } = await supabase
              .from('leads')
              .insert({
                restaurant_id: restaurantId,
                status: 'NEW',
                created_by_user_id: profile?.id
              });
              
            if (leadError) throw leadError;
            
            messages.push(`Row ${totalProcessed}: Created new lead for ${restaurantData.name}`);
            successCount++;
          } catch (error: any) {
            console.error('Error processing row:', error);
            errorCount++;
            messages.push(`Row ${totalProcessed}: Error - ${error.message || 'Unknown error'}`);
          }
        }

        setImportResults({
          total: totalProcessed,
          created: successCount,
          errors: errorCount,
          messages
        });
        
        setImportStatus('success');
        
        toast({
          title: "Import Completed",
          description: `Processed ${totalProcessed} records: ${successCount} successful, ${errorCount} errors`,
        });
        
      };
      
      reader.readAsText(file);
      
    } catch (error: any) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportResults(prev => ({
        ...prev,
        messages: [...prev.messages, `Overall error: ${error.message || 'Unknown error occurred'}`]
      }));
      
      toast({
        title: "Import Failed",
        description: error.message || "An unknown error occurred during import",
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMappings([]);
    setImportStatus('idle');
    setImportResults({ total: 0, created: 0, errors: 0, messages: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is restricted to administrators.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">CSV Import</h1>
        </div>

        {importStatus !== 'success' ? (
          <Card>
            <CardHeader>
              <CardTitle>Import Restaurants and Leads</CardTitle>
              <CardDescription>
                Use this tool to bulk import restaurant data from CSV files. For each restaurant,
                a new lead record will be created with status "NEW".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <Input 
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={importStatus === 'loading'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    File should be CSV format with a header row. Required fields are Restaurant Name and Primary Phone.
                  </p>
                </div>

                {csvHeaders.length > 0 && (
                  <>
                    <div className="space-y-4 border rounded-md p-4">
                      <h3 className="font-medium">Map CSV Columns to Database Fields</h3>
                      <p className="text-sm text-muted-foreground">
                        Associate each column in your CSV with the corresponding field in the database.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mappings.map((mapping, index) => (
                          <div key={index} className="space-y-2 border p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`mapping-${index}`} className="font-medium truncate">
                                {mapping.csvColumn}
                              </Label>
                              {mapping.example && (
                                <span className="text-xs text-muted-foreground truncate">
                                  Example: {mapping.example}
                                </span>
                              )}
                            </div>
                            <select
                              id={`mapping-${index}`}
                              className="w-full border border-input rounded-md px-3 py-1 text-sm"
                              value={mapping.dbField}
                              onChange={(e) => handleMappingChange(mapping.csvColumn, e.target.value)}
                            >
                              <option value="">-- Ignore this column --</option>
                              {availableDbFields.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label} {field.required ? '(Required)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {csvData.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Preview</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                {csvHeaders.map((header, index) => (
                                  <th key={index} className="border p-2 text-left bg-muted">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="border p-2">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={resetImport} 
                        disabled={importStatus === 'loading'}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImport} 
                        disabled={!isValidMapping() || importStatus === 'loading'}
                      >
                        {importStatus === 'loading' ? 'Importing...' : 'Import Data'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                Summary of the import process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <div className="text-2xl font-bold">{importResults.total}</div>
                    <div className="text-sm text-muted-foreground">Total Records Processed</div>
                  </div>
                  <div className="border rounded-md p-4 text-center bg-green-50">
                    <div className="text-2xl font-bold text-green-600">{importResults.created}</div>
                    <div className="text-sm text-muted-foreground">Successfully Created</div>
                  </div>
                  <div className="border rounded-md p-4 text-center bg-red-50">
                    <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Import Log</h3>
                  <div className="border rounded-md bg-muted/30 p-4 max-h-96 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {importResults.messages.map((msg, idx) => (
                        <li key={idx} className={`${msg.includes('Error') ? 'text-red-600' : ''}`}>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={resetImport}>
                    Start New Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Information about CSV structure and requirements */}
        <Alert>
          <AlertTitle>CSV Format Requirements</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Your CSV file should contain the following headers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Restaurant Name</strong> - Required for creating restaurants</li>
              <li><strong>Primary Phone</strong> - Required, used to detect duplicates</li>
              <li><strong>Township</strong> - Optional, location information</li>
              <li><strong>Address</strong> - Optional, detailed location</li>
              <li><strong>Contact Person</strong> - Optional, restaurant point of contact</li>
              <li><strong>Additional Information</strong> - Optional, any notes about the restaurant</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Duplicates are detected by matching phone numbers. If a restaurant with the same primary phone already exists,
              only a new lead will be created for that existing restaurant.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default ImportPage;
