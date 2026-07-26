import React from 'react';

export interface CategorySkeletonProps {
  isMobile?: boolean;
}

export const CategorySkeleton: React.FC<CategorySkeletonProps> = ({ isMobile }) => {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 bg-gray-200 rounded mt-1 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="border-t border-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-8" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-10 bg-gray-200 rounded-full" />
                <div className="h-9 w-9 bg-gray-100 rounded-full" />
                <div className="h-9 w-9 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="py-3.5 px-4 w-10">
                <div className="h-4 w-4 bg-gray-200 rounded" />
              </th>
              {Array.from({ length: 5 }).map((_, idx) => (
                <th key={idx} className="py-3.5 px-4">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="py-4 px-4">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-100 rounded w-28 font-mono" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-12" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 w-10 bg-gray-200 rounded-full" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-gray-100 rounded-full" />
                    <div className="h-9 w-9 bg-gray-100 rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategorySkeleton;
