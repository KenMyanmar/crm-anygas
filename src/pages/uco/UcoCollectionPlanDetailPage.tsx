
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UcoBulkRestaurantSelector } from '@/components/uco/UcoBulkRestaurantSelector';
import { PlanHeader } from '@/components/uco/plan-detail/PlanHeader';
import { PlanInfoCards } from '@/components/uco/plan-detail/PlanInfoCards';
import { CollectionItemsList } from '@/components/uco/plan-detail/CollectionItemsList';
import { usePlanDetailPage } from '@/hooks/usePlanDetailPage';
import { AlertCircle } from 'lucide-react';

const UcoCollectionPlanDetailPage = () => {
  const {
    plan,
    items,
    itemsLoading,
    itemsError,
    isOwner,
    showRestaurantSelector,
    setShowRestaurantSelector,
    handleAddRestaurants,
    handleBack,
    handleOptimizeRoute,
  } = usePlanDetailPage();

  if (!plan) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The collection plan you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={handleBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PlanHeader
        planName={plan.plan_name}
        isOwner={isOwner}
        onBack={handleBack}
        onAddRestaurants={() => setShowRestaurantSelector(true)}
        onOptimizeRoute={handleOptimizeRoute}
      />

      <PlanInfoCards plan={plan} />

      {/* Error Alert */}
      {itemsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading the collection items. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      )}

      <CollectionItemsList
        items={items}
        itemsLoading={itemsLoading}
        isOwner={isOwner}
        onAddRestaurants={() => setShowRestaurantSelector(true)}
        planId={plan.id}
      />

      <Dialog open={showRestaurantSelector} onOpenChange={setShowRestaurantSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Restaurants to Collection Plan</DialogTitle>
            <DialogDescription>
              Select restaurants to add to your UCO collection plan. You can filter by township and search for specific restaurants.
            </DialogDescription>
          </DialogHeader>
          <UcoBulkRestaurantSelector
            onConfirm={handleAddRestaurants}
            onCancel={() => setShowRestaurantSelector(false)}
            selectedTownship={plan.townships.length === 1 ? plan.townships[0] : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UcoCollectionPlanDetailPage;
