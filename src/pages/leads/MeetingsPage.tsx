
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus, Calendar, MapPin, Clock, Info } from "lucide-react";
import { formatDate } from "@/lib/supabase";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MeetingForm from "@/components/leads/MeetingForm";

interface Restaurant {
  id: string;
  name: string;
  township?: string;
  address?: string;
}

interface Meeting {
  id: string;
  restaurant_id: string;
  scheduled_by_user_id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration_minutes: number;
  location?: string;
  meeting_type: string;
  status: string;
  outcome?: string;
  action_items?: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          restaurant:restaurant_id (
            id,
            name,
            township,
            address
          )
        `)
        .order('meeting_date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setMeetings(data || []);
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meetings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleMeetingCreated = () => {
    setOpenCreateDialog(false);
    fetchMeetings();
    toast({
      title: 'Success',
      description: 'Meeting scheduled successfully',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'RESCHEDULED': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.meeting_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      return meetingDate >= today && meeting.status !== 'CANCELLED' && meeting.status !== 'COMPLETED';
    } else if (activeTab === 'past') {
      return meetingDate < today || meeting.status === 'COMPLETED';
    } else if (activeTab === 'cancelled') {
      return meeting.status === 'CANCELLED';
    }
    return true;
  });

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        </div>
        
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule a New Meeting</DialogTitle>
              <DialogDescription>
                Create a new meeting with a restaurant. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            <MeetingForm onComplete={handleMeetingCreated} />
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-muted-foreground">
        Schedule and manage meetings with restaurant owners and staff.
      </p>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
              <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
              <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
            </div>
          ) : filteredMeetings.length > 0 ? (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>{meeting.restaurant?.name}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(meeting.meeting_date)} at {formatMeetingTime(meeting.meeting_date)}
                        </span>
                      </div>
                      
                      {meeting.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{meeting.duration_minutes} minutes</span>
                      </div>
                      
                      {meeting.description && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          <Info className="h-4 w-4" />
                          <span>{meeting.description}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-end w-full gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Update Status</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mt-2">No upcoming meetings</h3>
                <p className="text-muted-foreground">
                  You don't have any upcoming meetings scheduled.
                </p>
                <Button onClick={() => setOpenCreateDialog(true)} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Schedule a Meeting
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
              <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
            </div>
          ) : filteredMeetings.length > 0 ? (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>{meeting.restaurant?.name}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(meeting.meeting_date)} at {formatMeetingTime(meeting.meeting_date)}
                        </span>
                      </div>
                      
                      {meeting.outcome && (
                        <>
                          <Separator className="my-2" />
                          <div className="space-y-1">
                            <h4 className="font-medium">Outcome</h4>
                            <p className="text-muted-foreground">{meeting.outcome}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-end w-full gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mt-2">No past meetings</h3>
                <p className="text-muted-foreground">
                  You don't have any past or completed meetings.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-4">
          {isLoading ? (
            <div className="h-20 bg-muted/60 animate-pulse rounded-md" />
          ) : filteredMeetings.length > 0 ? (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>{meeting.restaurant?.name}</CardDescription>
                      </div>
                      <Badge className="bg-red-500 text-white">Cancelled</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(meeting.meeting_date)} at {formatMeetingTime(meeting.meeting_date)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mt-2">No cancelled meetings</h3>
                <p className="text-muted-foreground">
                  You don't have any cancelled meetings.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingsPage;
