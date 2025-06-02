
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Map, Navigation } from 'lucide-react';
import { VisitTask } from '@/types/visits';
import GoogleMapsVisitRoute from './GoogleMapsVisitRoute';

interface QuickMapAccessProps {
  tasks: VisitTask[];
}

const QuickMapAccess = ({ tasks }: QuickMapAccessProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsMapOpen(true)}
        className="flex items-center space-x-2"
      >
        <Map className="h-4 w-4" />
        <span>View Route Map</span>
        <Navigation className="h-4 w-4" />
      </Button>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          <div className="p-6">
            <GoogleMapsVisitRoute tasks={tasks} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickMapAccess;
