
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VisitsTownshipsTableProps {
  visitsByTownship: any[];
}

export const VisitsTownshipsTable = ({ visitsByTownship }: VisitsTownshipsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Distribution by Township</CardTitle>
        <CardDescription>Areas with highest visit frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visitsByTownship.map((township, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{index + 1}</Badge>
                <div>
                  <p className="font-medium">{township.township}</p>
                  <p className="text-sm text-muted-foreground">{township.count} visits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{township.percentage}%</p>
                <p className="text-sm text-muted-foreground">of total visits</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
