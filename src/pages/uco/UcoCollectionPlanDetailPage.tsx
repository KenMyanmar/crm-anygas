
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UcoBulkRestaurantSelector } from '@/components/uco/UcoBulkRestaurantSelector';
import { PlanHeader } from '@/components/uco/plan-detail/PlanHeader';
import { PlanInfoCards } from '@/components/uco/plan-detail/PlanInfoCards';
import { CollectionItemsList } from '@/components/uco/plan-detail/CollectionItemsList';
import { usePlanDetailPage } from '@/hooks/usePlanDetailPage';

const UcoCollectionPlanDetailPage = () => {
  const {
    plan,
    items,
    itemsLoading,
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

      <CollectionItemsList
        items={items}
        itemsLoading={itemsLoading}
        isOwner={isOwner}
        onAddRestaurants={() => setShowRestaurantSelector(true)}
      />

      <Dialog open={showRestaurantSelector} onOpenChange={setShowRestaurantSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Restaurants to Collection Plan</DialogTitle>
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
