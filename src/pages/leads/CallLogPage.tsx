
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

const CallLogPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Phone className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Call Log</h1>
      </div>
      <p className="text-muted-foreground">
        Track and manage all calls with restaurant leads and customers.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Call Tracking Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will allow you to log and track all your calls with potential and existing customers.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>Log new calls with detailed notes</li>
              <li>Record call outcomes and follow-up actions</li>
              <li>Set reminders for callback appointments</li>
              <li>View call history by restaurant</li>
              <li>Generate reports on call activity and outcomes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogPage;
