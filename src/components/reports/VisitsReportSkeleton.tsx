
export const VisitsReportSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
};
