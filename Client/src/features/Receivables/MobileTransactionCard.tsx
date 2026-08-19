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
  const isNegative = transaction.amount < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="bg-white rounded-2xl border border-gray-100 p-4"
    >
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-gray-400">{t('receivables.date')}</span>
        <span className="text-sm font-semibold text-gray-900">
          {transaction.date}
        </span>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {t('receivables.referenceNumber')}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {transaction.referenceNumber}
        </span>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{t('receivables.status')}</span>
        <StatusBadge status={transaction.status} />
      </div>

      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{t('receivables.amount')}</span>
        <span
          className={`text-sm font-semibold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}
        >
          {isNegative ? '-' : ''}
          {formatAmount(transaction.amount)} {t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' })}
        </span>
      </div>
    </motion.div>
  );
}
