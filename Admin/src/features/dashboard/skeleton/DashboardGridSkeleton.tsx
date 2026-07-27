const DashboardGridSkeleton = () => {
  return (
    <div className="mb-10">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-lg p-3 lg:p-5 shadow-sm max-sm:h-30 lg:h-38.75 flex flex-col lg:justify-between justify-evenly animate-pulse"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            {/* Content */}
            <div className="flex items-end justify-between max-sm:flex-col max-sm:items-start">
              <div className="pb-2">
                <div className="flex items-end gap-2">
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-10 bg-gray-200 rounded mb-1" />
                </div>
              </div>

              <div className="h-7 w-16 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGridSkeleton;
