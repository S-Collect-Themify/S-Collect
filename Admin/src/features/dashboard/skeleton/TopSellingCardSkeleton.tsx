const TopSellingCardSkeleton = () => {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-3 animate-pulse">
      {/* Product Image */}
      <div className="h-14 w-14 rounded-lg bg-gray-200 shrink-0" />

      {/* Product Info */}
      <div className="flex-1">
        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />

        <div className="flex items-center gap-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />

          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="flex flex-col items-end min-w-25">
        <div className="h-6 w-24 bg-gray-200 rounded" />

        <div className="h-4 w-12 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  );
};

export default TopSellingCardSkeleton;
