import type { PayoutStatCardData } from '../types';
import PayoutStatCardItem from './PayoutStatCardItem';

interface PayoutStatCardsProps {
  stats: PayoutStatCardData[];
  isLoading?: boolean;
}

export default function PayoutStatCards({ stats, isLoading = false }: PayoutStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 animate-pulse">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-2xs space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded-md w-36" />
            <div className="flex items-baseline justify-between pt-1">
              <div className="h-8 bg-gray-200 rounded-md w-28" />
              <div className="h-5 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      {stats.map((stat) => (
        <PayoutStatCardItem key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
