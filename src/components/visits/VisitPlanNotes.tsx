
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisitPlanNotesProps {
  remarks?: string;
}

const VisitPlanNotes = ({ remarks }: VisitPlanNotesProps) => {
  if (!remarks) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{remarks}</p>
      </CardContent>
    </Card>
  );
};

export default VisitPlanNotes;
