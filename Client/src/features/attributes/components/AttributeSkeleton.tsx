export const AttributeSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between h-[230px]"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded-md w-3/5" />
                <div className="h-3.5 bg-gray-100 rounded-md w-2/5" />
              </div>
              <div className="h-6 w-12 bg-gray-100 rounded-full shrink-0" />
            </div>

            {/* Values Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-7 w-16 bg-gray-100 rounded-lg" />
              <div className="h-7 w-20 bg-gray-100 rounded-lg" />
              <div className="h-7 w-14 bg-gray-100 rounded-lg" />
              <div className="h-7 w-24 bg-gray-100 rounded-lg" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="h-8 w-24 bg-gray-100 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
