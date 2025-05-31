
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Database, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  RestaurantImportData,
  MigrationStats,
  parseCSVData,
  importRestaurantsToStaging,
  createRestaurantMappings,
  executeRestaurantReplacement,
} from '@/utils/restaurantMigration';

const RestaurantMigration = () => {
  const [csvData, setCsvData] = useState<RestaurantImportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import' | 'mapping' | 'execute'>('upload');
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
        const parsedData = parseCSVData(csvText);
        
        if (parsedData.length === 0) {
          toast({
            title: "No Data",
            description: "No valid restaurant data found in the file",
            variant: "destructive",
          });
          return;
        }

        setCsvData(parsedData);
        setCurrentStep('preview');
        
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

  const handleImportToStaging = async () => {
    setIsLoading(true);
    try {
      const result = await importRestaurantsToStaging(csvData);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.importedCount} restaurants to staging`,
        });
        setCurrentStep('mapping');
      } else {
        toast({
          title: "Import Failed",
          description: "Some restaurants failed to import",
          variant: "destructive",
        });
      }
      
      if (result.errors.length > 0) {
        console.log('Import errors:', result.errors);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMappings = async () => {
    setIsLoading(true);
    try {
      const result = await createRestaurantMappings();
      
      if (result.success) {
        setMigrationStats(result.stats);
        setCurrentStep('execute');
        
        toast({
          title: "Mappings Created",
          description: `Found ${result.stats.successfulMatches} exact matches and ${result.stats.partialMatches} partial matches`,
        });
      } else {
        toast({
          title: "Mapping Failed",
          description: "Failed to create restaurant mappings",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteReplacement = async () => {
    setIsLoading(true);
    try {
      const result = await executeRestaurantReplacement();
      
      if (result.success) {
        toast({
          title: "Migration Complete",
          description: result.message,
        });
        
        // Reset the form
        setCsvData([]);
        setMigrationStats(null);
        setCurrentStep('upload');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'upload': return 0;
      case 'preview': return 25;
      case 'import': return 50;
      case 'mapping': return 75;
      case 'execute': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Restaurant Data Migration
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>
                Upload
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={currentStep !== 'preview'}>
                Preview
              </TabsTrigger>
              <TabsTrigger value="mapping" disabled={currentStep !== 'mapping'}>
                Mapping
              </TabsTrigger>
              <TabsTrigger value="execute" disabled={currentStep !== 'execute'}>
                Execute
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Upload Restaurant Data (CSV)</Label>
                  <div className="mt-2">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    CSV should include columns: name, township, address, phone, contact_person, remarks
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Preview Data</h3>
                  <Badge variant="outline">
                    {csvData.length} restaurants
                  </Badge>
                </div>
                
                <div className="max-h-96 overflow-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Township</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Contact Person</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((restaurant, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{restaurant.name}</td>
                          <td className="p-2">{restaurant.township || '-'}</td>
                          <td className="p-2">{restaurant.phone || '-'}</td>
                          <td className="p-2">{restaurant.contact_person || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 10 && (
                    <div className="p-2 text-center text-muted-foreground border-t">
                      ... and {csvData.length - 10} more restaurants
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentStep('upload')}
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleImportToStaging}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Importing...' : 'Import to Staging'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create Dependency Mappings</h3>
                <p className="text-muted-foreground">
                  This step will match new restaurants with existing data to preserve relationships.
                </p>
                
                <Button
                  onClick={handleCreateMappings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating Mappings...' : 'Create Mappings'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="execute" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Migration Summary</h3>
                
                {migrationStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Exact Matches</span>
                        </div>
                        <p className="text-2xl font-bold">{migrationStats.successfulMatches}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Partial Matches</span>
                        </div>
                        <p className="text-2xl font-bold">{migrationStats.partialMatches}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">No Matches</span>
                        </div>
                        <p className="text-2xl font-bold">{migrationStats.noMatches}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Dependencies</span>
                        </div>
                        <p className="text-sm">
                          {migrationStats.dependencies.orders} orders, {migrationStats.dependencies.leads} leads, {migrationStats.dependencies.visitTasks} visits
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="destructive">
                      Execute Restaurant Replacement
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Restaurant Replacement</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently replace all existing restaurant data with the new data.
                        All dependencies have been backed up and will be preserved. This action cannot be undone.
                        Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleExecuteReplacement}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Replace Restaurants
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantMigration;
