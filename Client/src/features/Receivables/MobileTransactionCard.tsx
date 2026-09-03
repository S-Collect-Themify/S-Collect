import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Transaction } from './constants';
import StatusBadge from './StatusBadge';
import { formatAmount } from './utils';

interface MobileTransactionCardProps {
  transaction: Transaction;
  index: number;
}

export default function MobileTransactionCard({
  transaction,
  index,
}: MobileTransactionCardProps) {
  const { t } = useTranslation();
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs"
    >
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-gray-400">{t('receivables.date')}</span>
        <span className="text-sm font-medium text-gray-900">
          {transaction.date}
        </span>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {t('receivables.referenceNumber')}
        </span>
        <div className="text-end">
          <span className="text-sm font-normal text-gray-400">
            {transaction.referenceNumber}
          </span>
          {note && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[180px]">
              {note}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{t('receivables.status')}</span>
        <StatusBadge status={statusToDisplay} />
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{t('receivables.amount')}</span>
        <span
          className={`text-sm font-bold ${
            isNegative ? 'text-red-500' : 'text-gray-900'
          }`}
        >
          {isNegative ? `-$${formattedAmountValue}` : `$${formattedAmountValue}`}
        </span>
      </div>
    </motion.div>
  );
}
