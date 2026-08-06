import React from 'react';

interface ShippingZonesSkeletonProps {
  isMobile?: boolean;
}

export const ShippingZonesSkeleton: React.FC<ShippingZonesSkeletonProps> = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between gap-4 animate-pulse"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-36" />
              <div className="h-3 bg-gray-200 rounded-md w-28" />
            </div>

            <div className="shrink-0">
              <div className="h-6 bg-gray-200 rounded-full w-11" />
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
            <th className="py-4 px-6">Zone Name</th>
            <th className="py-4 px-6">Vendors Count</th>
            <th className="py-4 px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="py-4 px-6">
                <div className="h-4 bg-gray-200 rounded-md w-40" />
              </td>
              <td className="py-4 px-6">
                <div className="h-4 bg-gray-200 rounded-md w-32" />
              </td>
              <td className="py-4 px-6">
                <div className="h-6 bg-gray-200 rounded-full w-11" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
