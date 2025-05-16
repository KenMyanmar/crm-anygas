
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

const MeetingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
      </div>
      <p className="text-muted-foreground">
        Schedule and manage meetings with restaurant owners and staff.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Meeting Calendar Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will allow you to schedule, track, and manage all your meetings with restaurant partners.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>Schedule new meetings with date, time and location</li>
              <li>Set meeting agendas and talking points</li>
              <li>Receive notifications for upcoming meetings</li>
              <li>Record meeting outcomes and action items</li>
              <li>Sync with your calendar application</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsPage;
