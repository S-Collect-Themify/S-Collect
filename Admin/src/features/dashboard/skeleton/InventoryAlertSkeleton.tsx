import InventoryCardSkeleton from './InventoryCardSkeleton';

const InventoryAlertSkeleton = () => {
  return (
    <div className="w-full rounded-lg bg-white p-8 shadow h-128">
      {/* Header */}
      <div className="flex gap-2 items-center mb-6 animate-pulse">
        <div className="w-6 h-6 rounded bg-gray-200" />
        <div className="h-6 w-40 bg-gray-200 rounded" />
      </div>

      {/* Alert */}
      <div className="bg-gray-100 rounded-lg px-4 py-2.5 mb-6 animate-pulse">
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>

      {/* Cards */}
      <div className="mb-6 flex flex-col gap-3 h-[60%] overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <InventoryCardSkeleton key={index} />
        ))}
      </div>

      {/* Button */}
      <div className="h-12 w-full rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
};

export default InventoryAlertSkeleton;
