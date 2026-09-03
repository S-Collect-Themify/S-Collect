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
  const isNegative = transaction.amount < 0 || transaction.isAdjustment;
  const statusToDisplay = transaction.isAdjustment
    ? 'ADJUSTED'
    : transaction.status;

  const note =
    typeof transaction.referenceNote === 'string'
      ? transaction.referenceNote
      : typeof transaction.clarifyingNote === 'string'
        ? transaction.clarifyingNote
        : null;

  const formattedAmountValue = formatAmount(Math.abs(transaction.amount));

  return (
    <motion.tr
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
    >
      {/* Date */}
      <td className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap text-sm">
        {transaction.date}
      </td>

      {/* Reference Number */}
      <td className="px-6 py-5 whitespace-nowrap text-sm font-normal text-gray-400">
        <span>{transaction.referenceNumber}</span>
        {note && (
          <p
            className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]"
            title={note}
          >
            {note}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-5 whitespace-nowrap">
        <StatusBadge status={statusToDisplay} />
      </td>

      {/* Amount */}
      <td
        className={`px-6 py-5 font-bold text-end whitespace-nowrap text-sm ${
          isNegative ? 'text-red-500' : 'text-gray-900'
        }`}
      >
        {isNegative ? `-$${formattedAmountValue}` : `$${formattedAmountValue}`}
      </td>
    </motion.tr>
  );
}
