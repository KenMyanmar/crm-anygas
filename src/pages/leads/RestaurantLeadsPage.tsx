
import RestaurantLeads from "@/components/RestaurantLeads";

const RestaurantLeadsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant Leads Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and manage potential restaurant leads for UCO collection and LPG gas sales. 
            Select an existing restaurant and discover nearby establishments within a 5km radius.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <RestaurantLeads />
        </div>
        
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            This application helps you expand your restaurant database by finding nearby establishments
            and marking them as potential leads for your UCO and LPG business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLeadsPage;
