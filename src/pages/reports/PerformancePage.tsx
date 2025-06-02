
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

const PerformancePage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold tracking-tight">Performance Reports</h1>
      </div>
      <p className="text-muted-foreground">
        Track sales team performance metrics, goals, and achievement rates.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Sales Performance Dashboard Coming Soon</h2>
            <p className="text-muted-foreground">
              This section will provide comprehensive analytics on sales team performance and goal achievement.
            </p>
            <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
              <li>Individual salesperson performance metrics</li>
              <li>Team-based performance comparisons</li>
              <li>Goal tracking and achievement rates</li>
              <li>Time-based performance trends</li>
              <li>Opportunity analysis and forecasting tools</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
