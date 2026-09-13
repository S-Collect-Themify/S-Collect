export const CampaignSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded-md w-48" />
        <div className="h-4 bg-gray-100 rounded-md w-24" />
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 rounded-md w-1/2" />
              </div>
            </div>
            <div className="hidden sm:block w-32 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded-md w-full" />
              <div className="h-2.5 bg-gray-100 rounded-md w-2/3" />
            </div>
            <div className="hidden md:block w-28 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded-md w-full" />
              <div className="h-2 bg-gray-100 rounded-full w-full" />
            </div>
            <div className="hidden lg:block w-28">
              <div className="h-3.5 bg-gray-100 rounded-md w-20 ml-auto rtl:ml-0 rtl:mr-auto" />
            </div>
            <div className="w-20">
              <div className="h-8 bg-gray-100 rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
