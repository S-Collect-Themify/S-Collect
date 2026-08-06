import React from 'react';

interface BannersSkeletonProps {
  isMobile?: boolean;
}

export const BannersSkeleton: React.FC<BannersSkeletonProps> = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3"
          >
            {/* Top Row: Thumbnail + Title & Link */}
            <div className="flex items-start gap-3">
              <div className="w-24 h-14 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-16" />
              </div>
            </div>

            {/* Bottom Row: Status + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-3 bg-gray-200 rounded-md w-20" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-200" />
                <div className="w-7 h-7 rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 py-3.5 px-4 bg-gray-50/50 rounded-xl border border-gray-100 animate-pulse"
        >
          {/* Order & Drag Handle */}
          <div className="flex items-center gap-3 w-16">
            <div className="w-4 h-4 bg-gray-200 rounded-sm shrink-0" />
            <div className="w-5 h-4 bg-gray-200 rounded-sm shrink-0" />
          </div>

          {/* Thumbnail */}
          <div className="w-32 h-14 bg-gray-200 rounded-xl shrink-0" />

          {/* Title */}
          <div className="flex-1 min-w-0 px-2 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded-md w-48" />
            <div className="h-3 bg-gray-200 rounded-md w-32" />
          </div>

          {/* Link Type Badge */}
          <div className="w-24 px-2">
            <div className="h-6 bg-gray-200 rounded-lg w-20" />
          </div>

          {/* Status Badge */}
          <div className="w-24 px-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-20 justify-end">
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
