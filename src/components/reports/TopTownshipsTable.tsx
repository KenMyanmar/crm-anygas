
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopTownshipsTableProps {
  topTownships: any[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
};

export const TopTownshipsTable = ({ topTownships }: TopTownshipsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Townships</CardTitle>
        <CardDescription>Revenue and order performance by location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTownships.map((township, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{index + 1}</Badge>
                <div>
                  <p className="font-medium">{township.township}</p>
                  <p className="text-sm text-muted-foreground">{township.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(township.revenue)}</p>
                <p className="text-sm text-muted-foreground">
                  Avg: {formatCurrency(township.avgOrderValue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
