const SalesChartSkeleton = () => {
  return (
    <div className="w-full rounded-lg bg-white p-6 shadow h-128 animate-pulse">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>

      {/* Chart Area */}
      <div className="h-112.5 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gray-200 rounded" />
          ))}
        </div>

        {/* Grid lines */}
        <div className="ml-12 h-full flex flex-col justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-t border-gray-100 w-full" />
          ))}
        </div>

        {/* Fake line chart */}
        <svg
          className="absolute inset-0 ml-12 mt-4"
          viewBox="0 0 500 250"
          preserveAspectRatio="none"
        >
          <polyline
            points="20,180 100,120 180,150 260,70 340,100 420,30"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 w-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesChartSkeleton;
