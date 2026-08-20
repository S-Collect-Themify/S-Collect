import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { type ReturnItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_IMAGE } from '../../../utils/image';

interface ReturnRequestsTableProps {
  items: ReturnItem[];
  onReview: (id: string) => void;
}

export function ReturnRequestsTable({
  items,
  onReview,
}: ReturnRequestsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <th className="py-4 px-4">
              {t('returnsPage.returnId', { defaultValue: 'Return ID' })}
            </th>
            <th className="py-4 px-4">
              {t('returnsPage.customer', { defaultValue: 'Customer' })}
            </th>
            <th className="py-4 px-4">
              {t('returnsPage.product', { defaultValue: 'Product' })}
            </th>
            <th className="py-4 px-4">
              {t('returnsPage.reason', { defaultValue: 'Reason' })}
            </th>
            <th className="py-4 px-4">
              {t('returnsPage.requestedDate', {
                defaultValue: 'Requested Date',
              })}
            </th>
            <th className="py-4 px-4">
              {t('returnsPage.status', { defaultValue: 'Status' })}
            </th>
            <th className="py-4 px-4 text-right">
              {t('returnsPage.action', { defaultValue: 'Action' })}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <td className="py-4 px-4 font-bold text-amber-600 font-mono text-sm">
                  {item.id}
                </td>
                <td className="py-4 px-4 font-medium text-gray-900">
                  {item.customerName}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage || DEFAULT_IMAGE}
                      alt={item.productTitle}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <span className="font-semibold text-gray-900 truncate max-w-55">
                      {item.productTitle}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{item.reason}</td>
                <td className="py-4 px-4 text-gray-500 text-xs sm:text-sm">
                  {item.requestedDate}
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onReview(item.rawId || item.id)}
                    className="font-bold text-gray-900 hover:text-gray-600 underline cursor-pointer transition-colors"
                  >
                    {t('returnsPage.review', { defaultValue: 'Review' })}
                  </button>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="py-12 text-center text-gray-400 text-sm"
              >
                {t('returnsPage.noRequests', {
                  defaultValue: 'No return requests found.',
                })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
