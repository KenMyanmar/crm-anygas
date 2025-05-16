
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignedLeadsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Assigned Leads</h1>
      <p className="text-muted-foreground">
        View and manage leads that have been assigned to you.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Assigned Leads Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will display leads that have been assigned specifically to you, 
              allowing you to track your progress and manage your responsibilities.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>View all leads assigned to your account</li>
              <li>Filter by status, date assigned, and priority</li>
              <li>Update lead status and add notes</li>
              <li>Schedule follow-up calls and meetings</li>
              <li>Track conversion metrics for your assigned leads</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedLeadsPage;
