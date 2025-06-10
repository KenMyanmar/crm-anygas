
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface AnalyticsItem {
  township: string;
  total_restaurants: number;
  active_suppliers: number;
  total_collected_last_30_days?: number;
  visits_last_30_days: number;
}

interface AnalyticsTabProps {
  analytics: AnalyticsItem[] | undefined;
  onTownshipSelect: (township: string) => void;
}

export const AnalyticsTab = ({ analytics, onTownshipSelect }: AnalyticsTabProps) => {
  return (
    <div className="grid gap-4">
      {analytics?.map((item) => (
        <Card key={item.township}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {item.township}
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Total: {item.total_restaurants} restaurants</span>
                  <span>Active: {item.active_suppliers} suppliers</span>
                  <span>Collected: {item.total_collected_last_30_days?.toFixed(1) || 0}kg (30d)</span>
                  <span>Visits: {item.visits_last_30_days} (30d)</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTownshipSelect(item.township)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
