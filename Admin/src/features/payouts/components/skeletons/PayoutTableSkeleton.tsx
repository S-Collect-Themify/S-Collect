interface PayoutTableSkeletonProps {
  rowCount?: number;
}

export default function PayoutTableSkeleton({ rowCount = 6 }: PayoutTableSkeletonProps) {
  return (
    <tbody className="divide-y divide-gray-100 animate-pulse">
      {Array.from({ length: rowCount }).map((_, idx) => (
        <tr key={idx}>
          {/* Vendor Name */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-36 sm:w-44" />
          </td>
          {/* Total GMV */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-24" />
          </td>
          {/* Commission */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-20" />
          </td>
          {/* Total Payouts */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-20" />
          </td>
          {/* Pending Payout */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-24" />
          </td>
          {/* Actions */}
          <td className="px-5 py-4 text-end whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded-md w-24 ms-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
