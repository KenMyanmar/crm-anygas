
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';
import { RestaurantTimelineItem } from '@/types/orders';

interface RestaurantTimelineProps {
  restaurantId: string;
}

const RestaurantTimeline = ({ restaurantId }: RestaurantTimelineProps) => {
  const [timelineItems, setTimelineItems] = useState<RestaurantTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [restaurantId]);

  const fetchTimeline = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_restaurant_timeline', { restaurant_uuid: restaurantId });

      if (error) {
        throw error;
      }

      setTimelineItems(data || []);

    } catch (error: any) {
      console.error('Error fetching timeline:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="h-5 w-5" />;
      case 'LEAD':
        return <Users className="h-5 w-5" />;
      case 'VISIT':
        return <MapPin className="h-5 w-5" />;
      case 'MEETING':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ORDER':
        return 'text-green-500';
      case 'LEAD':
        return 'text-blue-500';
      case 'VISIT':
        return 'text-orange-500';
      case 'MEETING':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'closed_won':
        return 'default';
      case 'pending_confirmation':
      case 'planned':
      case 'contact_stage':
        return 'secondary';
      case 'confirmed':
      case 'in_progress':
      case 'demo_stage':
        return 'default';
      case 'cancelled':
      case 'closed_lost':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity Timeline ({timelineItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineItems.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-500">No activities have been recorded for this restaurant yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {index < timelineItems.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center ${getTypeColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          
                          {/* Metadata */}
                          {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {item.type === 'ORDER' && item.metadata.order_number && (
                                <div>Order: {item.metadata.order_number}</div>
                              )}
                              {item.metadata.total_amount && (
                                <div>Amount: {parseInt(item.metadata.total_amount).toLocaleString()} Kyats</div>
                              )}
                              {item.metadata.delivery_date_scheduled && (
                                <div>Scheduled: {formatDate(item.metadata.delivery_date_scheduled)}</div>
                              )}
                              {item.metadata.next_action_date && (
                                <div>Next Action: {formatDate(item.metadata.next_action_date)}</div>
                              )}
                              {item.metadata.meeting_date && (
                                <div>Meeting: {formatDate(item.metadata.meeting_date)}</div>
                              )}
                              {item.metadata.visit_time && (
                                <div>Visit: {formatDate(item.metadata.visit_time)}</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <div>{formatDate(item.created_at)}</div>
                          {item.created_by_name && (
                            <div className="text-xs">by {item.created_by_name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantTimeline;
