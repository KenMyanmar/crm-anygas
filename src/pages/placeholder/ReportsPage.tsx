
import DashboardLayout from '@/components/layouts/DashboardLayout';

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          This page will provide insights and analytics on sales performance, lead conversion, and other key metrics for the business.
        </p>
        
        <div className="border border-dashed rounded-lg p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Analytics Dashboard Coming Soon</h2>
          <p className="text-muted-foreground">
            The full implementation will include:
          </p>
          <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
            <li>Lead conversion rates by salesperson and overall</li>
            <li>Sales volume reporting (cylinders sold, revenue)</li>
            <li>Top performing restaurants by volume</li>
            <li>Time-based analytics (daily/weekly/monthly trends)</li>
            <li>Geographical distribution of customers</li>
            <li>Exportable reports in CSV format</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
