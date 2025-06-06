
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Trophy, Target } from 'lucide-react';

interface SalespersonPerformanceProps {
  performanceBySalesperson: Array<{ 
    name: string; 
    leadsCount: number; 
    conversions: number; 
    conversionRate: number; 
  }>;
}

export const SalespersonPerformance = ({ performanceBySalesperson }: SalespersonPerformanceProps) => {
  const sortedPerformance = [...performanceBySalesperson].sort((a, b) => b.conversionRate - a.conversionRate);

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 50) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 30) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (rate >= 15) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Salesperson Performance</span>
        </CardTitle>
        <CardDescription>Individual lead generation and conversion metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPerformance.map((person, index) => (
            <div key={person.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {person.leadsCount} leads • {person.conversions} conversions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{person.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="mt-1">
                  {getPerformanceBadge(person.conversionRate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
