
import DashboardLayout from '@/components/layouts/DashboardLayout';

const RestaurantsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">
          This page will contain the list of restaurants with search functionality, allowing users to view existing restaurants and create new ones.
        </p>
        
        <div className="border border-dashed rounded-lg p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Restaurant Management Coming Soon</h2>
          <p className="text-muted-foreground">
            The full implementation will include:
          </p>
          <ul className="list-disc list-inside text-left max-w-lg mx-auto mt-4 text-muted-foreground">
            <li>Search and filter restaurants by name, township, or phone number</li>
            <li>Create new restaurant records</li>
            <li>View detailed restaurant information</li>
            <li>Link to lead creation for existing restaurants</li>
            <li>View order history for restaurants</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantsPage;
