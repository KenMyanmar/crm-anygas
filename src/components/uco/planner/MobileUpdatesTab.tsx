
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { MobileStatusUpdater } from '@/components/uco/MobileStatusUpdater';
import { UcoCollectionItem } from '@/types/ucoCollection';
import { toast } from 'sonner';

interface MobileUpdatesTabProps {
  collectionItems: UcoCollectionItem[] | undefined;
  onImportDialogOpen: () => void;
}

export const MobileUpdatesTab = ({ 
  collectionItems, 
  onImportDialogOpen 
}: MobileUpdatesTabProps) => {
  if (!collectionItems || collectionItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Collection Items</h3>
          <p className="text-muted-foreground mb-4">
            Select a plan or import from Google Sheets to see mobile update interface
          </p>
          <Button variant="outline" onClick={onImportDialogOpen}>
            Import Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {collectionItems.map((item) => (
        <MobileStatusUpdater 
          key={item.id} 
          item={item as any}
          onUpdate={() => toast.success('Status updated successfully')}
        />
      ))}
    </div>
  );
};
