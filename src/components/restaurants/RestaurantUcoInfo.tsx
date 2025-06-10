
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { UcoStatusBadge } from '@/components/uco/UcoStatusBadge';
import { Calendar, Scale, Star, Truck } from 'lucide-react';

interface RestaurantUcoInfoProps {
  restaurantId: string;
}

type UcoStatus = 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed' | 'not_assessed';

interface UcoCollectionData {
  id: string;
  plan_name: string;
  plan_date: string;
  uco_status: UcoStatus;
  actual_volume_kg?: number;
  price_per_kg?: number;
  quality_score?: number;
  visit_time?: string;
  completed_at?: string;
  driver_notes?: string;
}

export const RestaurantUcoInfo = ({ restaurantId }: RestaurantUcoInfoProps) => {
  const [ucoData, setUcoData] = useState<UcoCollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUcoData();
  }, [restaurantId]);

  const fetchUcoData = async () => {
    try {
      setLoading(true);
      console.log('Fetching UCO data for restaurant:', restaurantId);
      
      const { data, error } = await supabase
        .from('uco_collection_items')
        .select(`
          *,
          plan:uco_collection_plans(
            plan_name,
            plan_date
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching UCO data:', error);
        return;
      }

      console.log('UCO data fetched:', data);
      
      const formattedData = data?.map(item => ({
        id: item.id,
        plan_name: item.plan?.plan_name || 'Unknown Plan',
        plan_date: item.plan?.plan_date || '',
        uco_status: (item.uco_status || 'not_assessed') as UcoStatus,
        actual_volume_kg: item.actual_volume_kg,
        price_per_kg: item.price_per_kg,
        quality_score: item.quality_score,
        visit_time: item.visit_time,
        completed_at: item.completed_at,
        driver_notes: item.driver_notes,
      })) || [];

      setUcoData(formattedData);
    } catch (error) {
      console.error('Error in fetchUcoData:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>UCO Collection History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading UCO data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>UCO Collection History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ucoData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No UCO collection records found
          </div>
        ) : (
          <div className="space-y-4">
            {ucoData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.plan_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.plan_date).toLocaleDateString()}</span>
                      {item.visit_time && (
                        <>
                          <span>•</span>
                          <span>Visited: {new Date(item.visit_time).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <UcoStatusBadge status={item.uco_status} />
                </div>

                {item.uco_status === 'have_uco' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {item.actual_volume_kg && (
                      <div className="flex items-center space-x-1">
                        <Scale className="h-4 w-4 text-green-600" />
                        <span>{item.actual_volume_kg}kg collected</span>
                      </div>
                    )}
                    {item.price_per_kg && (
                      <div>
                        <span className="font-medium">Price:</span> {item.price_per_kg} MMK/kg
                      </div>
                    )}
                    {item.quality_score && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>Quality: {item.quality_score}/5</span>
                      </div>
                    )}
                    {item.completed_at && (
                      <div className="text-green-600">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                )}

                {item.driver_notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span> {item.driver_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
