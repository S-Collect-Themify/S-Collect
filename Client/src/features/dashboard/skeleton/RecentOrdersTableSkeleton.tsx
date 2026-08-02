const RecentOrdersTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white min-h-[550px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {Array.from({ length: 6 }).map((_, index) => (
                <th key={index} className="px-8 py-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-8 py-6">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </td>

                <td className="px-8 py-6">
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                </td>

                <td className="px-8 py-6">
                  <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                </td>

                <td className="px-8 py-6">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </td>

                <td className="px-8 py-6">
                  <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
                </td>

                <td className="px-8 py-6">
                  <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTableSkeleton;
