
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface UcoPlanPageHeaderProps {
  onBack: () => void;
}

export const UcoPlanPageHeader = ({ onBack }: UcoPlanPageHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Create New UCO Collection Plan</h1>
        <p className="text-muted-foreground">Set up a new Used Cooking Oil collection schedule</p>
      </div>
    </div>
  );
};
