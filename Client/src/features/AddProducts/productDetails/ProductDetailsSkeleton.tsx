export default function ProductDetailsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Page Header Skeleton */}
      <div className="sidebar-page-container-header">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="sidebar-page-container space-y-8 mt-6">
        {/* ProductInfo Card Skeleton */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 lg:p-6">
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Gallery */}
            <div className="flex gap-3 flex-col-reverse md:flex-row">
              <div className="flex flex-row md:flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 rounded-lg bg-gray-200 shrink-0" />
                ))}
              </div>
              <div className="lg:h-96 lg:w-96 h-64 w-full rounded-xl bg-gray-200 shrink-0" />
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
                  <div className="h-9 w-9 rounded-full bg-gray-200" />
                </div>

                <div className="mt-2 flex gap-4">
                  <div className="h-5 w-28 bg-gray-200 rounded" />
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="h-10 w-44 bg-gray-200 rounded-lg" />
                <div className="flex gap-6">
                  <div className="h-10 w-36 bg-gray-200 rounded-lg" />
                  <div className="h-10 w-44 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ProductRating Card Skeleton */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex flex-col items-center w-full lg:w-1/4 space-y-3">
              <div className="h-16 w-24 bg-gray-200 rounded-xl" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 w-full space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-14 bg-gray-200 rounded" />
                  <div className="h-2 flex-1 bg-gray-200 rounded-full" />
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ReviewsList Skeleton */}
        <div className="w-full space-y-4">
          <div className="flex gap-2 p-4 rounded-2xl border border-gray-200 bg-white overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg shrink-0" />
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
