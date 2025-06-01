
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/supabase';
import { ChevronLeft, Calendar, MapPin, Clock, User, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Meeting {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration_minutes: number;
  location?: string;
  meeting_type: string;
  status: string;
  outcome?: string;
  action_items?: string;
  restaurant?: {
    id: string;
    name: string;
    township?: string;
  };
}

const MeetingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          restaurant:restaurant_id (
            id,
            name,
            township
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setMeeting(data);
    } catch (error: any) {
      console.error('Error fetching meeting:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!meeting) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Meeting not found</h2>
          <p className="text-gray-600 mt-2">The meeting you're looking for doesn't exist.</p>
          <Link to="/leads/meetings" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Meetings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'RESCHEDULED': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads/meetings')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Meetings
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
              <p className="text-muted-foreground">
                Meeting with {meeting.restaurant?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(meeting.status)} text-white`}>
              {meeting.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">{formatDate(meeting.meeting_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{meeting.duration_minutes} minutes</p>
                    </div>
                  </div>
                  
                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{meeting.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{meeting.meeting_type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>

                {meeting.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="text-sm">{meeting.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {(meeting.outcome || meeting.action_items) && (
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Outcome</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meeting.outcome && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Outcome</p>
                      <p className="text-sm">{meeting.outcome}</p>
                    </div>
                  )}
                  
                  {meeting.action_items && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Action Items</p>
                        <p className="text-sm">{meeting.action_items}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Restaurant Info Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    to={`/restaurants/${meeting.restaurant?.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {meeting.restaurant?.name}
                  </Link>
                  {meeting.restaurant?.township && (
                    <p className="text-sm text-muted-foreground">{meeting.restaurant.township}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeetingDetailPage;
