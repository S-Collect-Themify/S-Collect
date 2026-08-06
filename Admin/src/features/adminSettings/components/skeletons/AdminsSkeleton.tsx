import React from 'react';

interface AdminsSkeletonProps {
  isMobile?: boolean;
}

export const AdminsSkeleton: React.FC<AdminsSkeletonProps> = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="space-y-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3"
          >
            {/* Top Row: Info (No Avatar) + Role Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded-md w-32" />
                <div className="h-3 bg-gray-200 rounded-md w-44" />
              </div>
              <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
            </div>

            {/* Status Toggle Bar Skeleton */}
            <div className="flex items-center justify-between py-2 border-t border-b border-gray-50">
              <div className="h-3 bg-gray-200 rounded-md w-12" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-5 bg-gray-200 rounded-full" />
                <div className="w-14 h-4 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Bottom Row: Date Added & Action Icon */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded-md w-16" />
                <div className="h-3 bg-gray-200 rounded-md w-24" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
          <tr>
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-6">Email</th>
            <th className="py-4 px-6">Role</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Date Added</th>
            <th className="py-4 px-6 text-right rtl:text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              {/* Name (No Avatar) */}
              <td className="py-4 px-6">
                <div className="h-4 bg-gray-200 rounded-md w-36" />
              </td>
              {/* Email */}
              <td className="py-4 px-6">
                <div className="h-4 bg-gray-200 rounded-md w-44" />
              </td>
              {/* Role Badge */}
              <td className="py-4 px-6">
                <div className="h-5 bg-gray-200 rounded-full w-20" />
              </td>
              {/* Status Toggle & Badge */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-5 bg-gray-200 rounded-full" />
                  <div className="w-14 h-4 bg-gray-200 rounded-full" />
                </div>
              </td>
              {/* Date Added */}
              <td className="py-4 px-6">
                <div className="h-4 bg-gray-200 rounded-md w-28" />
              </td>
              {/* Actions */}
              <td className="py-4 px-6 text-right rtl:text-left">
                <div className="flex items-center justify-end">
                  <div className="w-8 h-8 rounded-lg bg-gray-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
