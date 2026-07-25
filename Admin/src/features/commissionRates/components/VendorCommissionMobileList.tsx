import { SquarePen } from 'lucide-react';
import type { VendorCommissionItem } from '../types';
import CommissionStatusBadge from './CommissionStatusBadge';
import CommissionCardSkeleton from './skeletons/CommissionCardSkeleton';

interface VendorCommissionMobileListProps {
  items: VendorCommissionItem[];
  onEdit: (item: VendorCommissionItem) => void;
  isLoading?: boolean;
}

export default function VendorCommissionMobileList({
  items,
  onEdit,
  isLoading = false,
}: VendorCommissionMobileListProps) {
  if (isLoading) {
    return (
      <div className="block md:hidden">
        <CommissionCardSkeleton cardCount={5} />
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2.5"
        >
          {/* Top Row: Vendor Name & Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-sm text-gray-900">
              {item.vendorName}
            </span>
            <CommissionStatusBadge status={item.status} />
          </div>

          {/* Bottom Row: Rate & Edit Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline text-xs text-gray-500 font-medium">
              <span>Rate:</span>
              <span className="font-bold text-gray-900 ms-1">
                {item.rate.toFixed(2)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.vendorName}`}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
            >
              <SquarePen size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
