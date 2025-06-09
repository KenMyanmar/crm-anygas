
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleSheetsIntegration } from '@/hooks/useGoogleSheetsIntegration';
import { GoogleSheetsImporter } from '@/components/uco/GoogleSheetsImporter';
import { UcoCollectionPlanner as ExistingPlanner } from '@/components/uco/UcoCollectionPlanner';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UcoCollectionPlanner = () => {
  const navigate = useNavigate();
  const [showImporter, setShowImporter] = useState(false);
  const { importFromGoogleSheets, exportToGoogleSheets } = useGoogleSheetsIntegration();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/uco/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UCO Collection Planner</h1>
            <p className="text-muted-foreground">
              Create and manage UCO collection plans with truck assignments
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowImporter(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import from Sheets
          </Button>
          <Button onClick={() => navigate('/uco/planner/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {showImporter ? (
        <Card>
          <CardHeader>
            <CardTitle>Import UCO Collection Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleSheetsImporter onImportComplete={() => setShowImporter(false)} />
          </CardContent>
        </Card>
      ) : (
        <ExistingPlanner />
      )}
    </div>
  );
};

export default UcoCollectionPlanner;
