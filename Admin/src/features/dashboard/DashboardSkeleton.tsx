export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Greeting / Title Bar Skeleton */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-2">
          <div className="h-3.5 w-32 bg-gray-200 rounded-md" />
          <div className="h-3 w-40 bg-gray-200 rounded-md" />
          <div className="h-6 w-36 bg-gray-300 rounded-lg mt-2" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* 4 Stat Cards Grid Skeleton (Mobile 2-col, Desktop 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-200" />
              <div className="h-3.5 w-20 bg-gray-200 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-6 w-24 bg-gray-300 rounded-lg" />
              <div className="h-5 w-12 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
              <div className="h-6 w-36 bg-gray-300 rounded-lg" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-48 w-full bg-gray-100 rounded-lg" />
        </div>

        {/* Orders Donut Skeleton */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-gray-200 rounded-md" />
            <div className="h-3 w-16 bg-gray-200 rounded-md" />
            <div className="h-6 w-20 bg-gray-300 rounded-lg" />
          </div>
          <div className="w-36 h-36 rounded-full border-8 border-gray-200 mx-auto flex items-center justify-center">
            <div className="h-4 w-12 bg-gray-200 rounded-md" />
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <div className="h-3 w-14 bg-gray-200 rounded-md" />
            <div className="h-3 w-14 bg-gray-200 rounded-md" />
            <div className="h-3 w-14 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* Voucher Overview Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-gray-300 rounded-lg" />
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
        </div>

        {/* 3 Voucher Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2">
            <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
            <div className="h-6 w-12 bg-gray-300 rounded-lg" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2">
            <div className="h-3.5 w-28 bg-gray-200 rounded-md" />
            <div className="h-6 w-28 bg-gray-300 rounded-lg" />
          </div>
          <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2">
            <div className="h-3.5 w-32 bg-gray-200 rounded-md" />
            <div className="h-6 w-16 bg-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Table / Cards Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-10 w-full bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Top Performing Vendors Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-gray-300 rounded-lg" />
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-12 w-full bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
