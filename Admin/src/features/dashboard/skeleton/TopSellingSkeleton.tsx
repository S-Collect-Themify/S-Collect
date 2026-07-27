import TopSellingCardSkeleton from './TopSellingCardSkeleton';

const TopSellingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto bg-white p-4 rounded-lg shadow h-137.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 animate-pulse">
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>

      {/* Products */}
      <div className="flex flex-col gap-2 overflow-y-auto h-[85%]">
        {Array.from({ length: 8 }).map((_, index) => (
          <TopSellingCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default TopSellingSkeleton;
