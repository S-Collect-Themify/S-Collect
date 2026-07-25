interface CommissionTableSkeletonProps {
  rowCount?: number;
}

export default function CommissionTableSkeleton({ rowCount = 5 }: CommissionTableSkeletonProps) {
  return (
    <tbody className="divide-y divide-gray-100 animate-pulse">
      {Array.from({ length: rowCount }).map((_, idx) => (
        <tr key={idx}>
          {/* Column 1: Name */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-36 sm:w-44" />
          </td>
          {/* Column 2: Custom Rate (%) */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-16" />
          </td>
          {/* Column 3: Status Badge */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </td>
          {/* Column 4: Last Updated Date */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-24" />
          </td>
          {/* Column 5: Action Button */}
          <td className="px-5 py-4 text-end whitespace-nowrap">
            <div className="w-8 h-8 bg-gray-200 rounded-lg ms-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
