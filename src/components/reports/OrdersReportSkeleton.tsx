
export const OrdersReportSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
};
