
import DashboardLayout from '@/components/layouts/DashboardLayout';

const LeadsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
        <p className="text-muted-foreground">
          This page will contain the Kanban board view for lead management. Admin users will be able to see all leads,
          while salespersons will only see leads assigned to them plus unassigned leads.
        </p>
        
        <div className="border border-dashed rounded-lg p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Kanban Board Coming Soon</h2>
          <p className="text-muted-foreground">
            The full implementation will include:
          </p>
          <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
            <li>Drag and drop lead cards between status columns</li>
            <li>Lead assignment functionality</li>
            <li>Quick view of restaurant details</li>
            <li>Filtering options by township, status, and assigned user</li>
            <li>Create new lead functionality</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
