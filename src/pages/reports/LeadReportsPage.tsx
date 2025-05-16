
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

const LeadReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Lead Reports</h1>
      </div>
      <p className="text-muted-foreground">
        Analyze lead generation, conversion rates, and sales pipeline metrics.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Lead Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Lead Analytics Dashboard Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will provide detailed analytics and reporting on lead activity and conversion metrics.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>Track lead sources and acquisition channels</li>
              <li>Measure conversion rates across each pipeline stage</li>
              <li>Analyze performance by salesperson and region</li>
              <li>View time-based trends in lead generation</li>
              <li>Export detailed reports for management review</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadReportsPage;
