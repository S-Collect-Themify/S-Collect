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
  const isNegative = transaction.amount < 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors py-8"
    >
      <td className="px-3 py-6 font-semibold text-gray-900">
        {transaction.date}
      </td>
      <td className="px-3 py-6 font-semibold text-gray-900">
        {transaction.referenceNumber}
      </td>
      <td className="px-3 py-6">
        <StatusBadge status={transaction.status} />
      </td>
      <td
        className={`px-3 py-6 font-semibold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}
      >
        {isNegative ? '-' : ''}
        {formatAmount(transaction.amount)} {t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' })}
      </td>
    </motion.tr>
  );
}
