import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="p-3 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 animate-pulse border border-gray-100"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 bg-gray-200 rounded w-2/5" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
