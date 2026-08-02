import type { PendingPayoutItem } from '../types';
import PayoutCardSkeleton from './skeletons/PayoutCardSkeleton';
import PayoutMobileCard from './PayoutMobileCard';

interface PayoutsMobileListProps {
  items: PendingPayoutItem[];
  onRegisterPayout: (item: PendingPayoutItem) => void;
  isLoading?: boolean;
}

export default function PayoutsMobileList({
  items,
  onRegisterPayout,
  isLoading = false,
}: PayoutsMobileListProps) {
  if (isLoading) {
    return (
      <div className="block md:hidden">
        <PayoutCardSkeleton cardCount={5} />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
        No pending payouts found.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3">
      {items.map((item) => (
        <PayoutMobileCard
          key={item.id}
          item={item}
          onRegisterPayout={onRegisterPayout}
        />
      ))}
    </div>
  );
}
