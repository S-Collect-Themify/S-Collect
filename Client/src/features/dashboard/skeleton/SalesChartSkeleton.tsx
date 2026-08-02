const SalesChartSkeleton = () => {
  return (
    <div className="w-full rounded-xl bg-white p-6 shadow h-[512px] animate-pulse">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>

      {/* Chart Area */}
      <div className="h-[400px] relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gray-200 rounded" />
          ))}
        </div>

        {/* Grid lines */}
        <div className="ml-12 h-[360px] flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-t border-gray-100 w-full" />
          ))}
        </div>

        {/* Fake line chart */}
        <div className="absolute top-0 bottom-10 left-12 right-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 500 200"
            preserveAspectRatio="none"
          >
            <polyline
              points="20,160 100,100 180,130 260,50 340,80 460,20"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 w-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesChartSkeleton;
