interface PayoutCardSkeletonProps {
  cardCount?: number;
}

export default function PayoutCardSkeleton({ cardCount = 5 }: PayoutCardSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: cardCount }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded-md w-36" />
            <div className="h-5 bg-gray-200 rounded-full w-14" />
          </div>

          {/* Key-Value lines */}
          <div className="space-y-2 py-1">
            <div className="flex justify-between">
              <div className="h-3.5 bg-gray-200 rounded-md w-20" />
              <div className="h-3.5 bg-gray-200 rounded-md w-24" />
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-gray-200 rounded-md w-20" />
              <div className="h-3.5 bg-gray-200 rounded-md w-20" />
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-gray-200 rounded-md w-20" />
              <div className="h-3.5 bg-gray-200 rounded-md w-20" />
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-gray-200 rounded-md w-24" />
              <div className="h-3.5 bg-gray-200 rounded-md w-24" />
            </div>
          </div>

          {/* Action button */}
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}
