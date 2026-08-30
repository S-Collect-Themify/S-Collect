import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Transaction } from './constants';
import StatusBadge from './StatusBadge';
import { formatAmount } from './utils';

export default function TransactionRow({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const { t } = useTranslation();
  const isNegative = transaction.amount < 0 || transaction.isAdjustment;

  const note =
    typeof transaction.referenceNote === 'string'
      ? transaction.referenceNote
      : typeof transaction.clarifyingNote === 'string'
        ? transaction.clarifyingNote
        : null;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="border-b border-gray-100 hover:bg-gray-50/75 transition-colors"
    >
      {/* Date */}
      <td className="px-4 py-4.5 font-medium text-gray-900 whitespace-nowrap">
        {transaction.date}
      </td>

      {/* Reference Number */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        <span className="font-semibold text-gray-900">
          {transaction.referenceNumber}
        </span>
        {transaction.isAdjustment && (
          <span className="ms-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            {t('receivables.adjustment', { defaultValue: 'Adjustment' })}
          </span>
        )}
        {note && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]" title={note}>
            {note}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        <StatusBadge status={transaction.status} />
      </td>

      {/* Amount */}
      <td
        className={`px-4 py-4.5 font-semibold text-end whitespace-nowrap ${
          isNegative ? 'text-rose-600' : 'text-gray-900'
        }`}
      >
        {isNegative && transaction.amount > 0 ? '-' : ''}
        {formatAmount(transaction.amount)}{' '}
        <span className="text-xs font-normal text-gray-500">
          {t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' })}
        </span>
      </td>
    </motion.tr>
  );
}
