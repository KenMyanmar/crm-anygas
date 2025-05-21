
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/supabase';
import { Phone, Calendar, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_type: string;
  status: string;
  location?: string;
  description?: string;
}

interface Call {
  id: string;
  call_date: string;
  status: string;
  outcome?: string;
  notes?: string;
}

interface RestaurantActivityProps {
  restaurantId: string;
}

const RestaurantActivity = ({ restaurantId }: RestaurantActivityProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingCalls, setIsLoadingCalls] = useState(true);
  const [activeTab, setActiveTab] = useState('meetings');

  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoadingMeetings(true);
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('meeting_date', { ascending: false });

        if (error) {
          throw error;
        }

        setMeetings(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching meetings",
          description: error.message || "Failed to load meetings",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMeetings(false);
      }
    };

    const fetchCalls = async () => {
      setIsLoadingCalls(true);
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('call_date', { ascending: false });

        if (error) {
          throw error;
        }

        setCalls(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching calls",
          description: error.message || "Failed to load calls",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCalls(false);
      }
    };

    fetchMeetings();
    fetchCalls();
  }, [restaurantId]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="calls">Call Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meetings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>
                  Scheduled and past meetings with this restaurant
                </CardDescription>
              </div>
              <Button asChild>
                <Link to={`/leads/meetings/new?restaurantId=${restaurantId}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingMeetings ? (
                <div className="py-10 text-center text-muted-foreground">Loading meetings...</div>
              ) : meetings.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No meetings found for this restaurant
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.map((meeting) => (
                        <TableRow key={meeting.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link to={`/leads/meetings/${meeting.id}`} className="hover:underline">
                              {meeting.title}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(meeting.meeting_date)}</TableCell>
                          <TableCell>{meeting.meeting_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell>{meeting.status.replace(/_/g, ' ')}</TableCell>
                          <TableCell>{meeting.location || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calls">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Call Logs</CardTitle>
                <CardDescription>
                  Record of calls made to this restaurant
                </CardDescription>
              </div>
              <Button asChild>
                <Link to={`/leads/calls/new?restaurantId=${restaurantId}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Log Call
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingCalls ? (
                <div className="py-10 text-center text-muted-foreground">Loading call logs...</div>
              ) : calls.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No call logs found for this restaurant
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map((call) => (
                        <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link to={`/leads/calls/${call.id}`} className="hover:underline">
                              {formatDate(call.call_date)}
                            </Link>
                          </TableCell>
                          <TableCell>{call.status.replace(/_/g, ' ')}</TableCell>
                          <TableCell>{call.outcome || '-'}</TableCell>
                          <TableCell className="truncate max-w-xs">{call.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantActivity;
