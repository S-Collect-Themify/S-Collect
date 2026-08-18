import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { type ReturnItem } from '../types';
import { StatusBadge } from './StatusBadge';

interface ReturnRequestsMobileListProps {
  items: ReturnItem[];
  onReview: (id: string) => void;
}

export function ReturnRequestsMobileList({
  items,
  onReview,
}: ReturnRequestsMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden space-y-4">
      {items.length > 0 ? (
        items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, delay: idx * 0.03 }}
            className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-xs space-y-3.5"
          >
            {/* Top row: ID + Status */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-600 font-mono text-base">
                {item.id}
              </span>
              <StatusBadge status={item.status} />
            </div>

            {/* Middle row: Thumbnail + Title + Customer */}
            <div className="flex items-start gap-3.5">
              <img
                src={item.productImage}
                alt={item.productTitle}
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {item.productTitle}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('returnsPage.customer', { defaultValue: 'Customer' })}:{' '}
                  <span className="font-medium text-gray-700">
                    {item.customerName}
                  </span>
                </p>
              </div>
            </div>

            {/* Bottom row: Reason + Date + Review button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <div>
                <p className="text-gray-500">
                  {t('returnsPage.reason', { defaultValue: 'Reason' })}:{' '}
                  <span className="text-gray-800 font-semibold">
                    {item.reason}
                  </span>
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  {item.requestedDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onReview(item.rawId || item.id)}
                className="py-2 px-4 rounded-xl bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {t('returnsPage.review', { defaultValue: 'Review' })}
              </button>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm">
          {t('returnsPage.noRequests', {
            defaultValue: 'No return requests found.',
          })}
        </div>
      )}
    </div>
  );
}
