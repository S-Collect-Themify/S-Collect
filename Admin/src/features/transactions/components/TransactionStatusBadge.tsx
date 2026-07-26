import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TransactionStatus } from '../types/transaction.types';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const badgeStyles: Record<TransactionStatus, string> = {
    Captured: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Failed: 'bg-red-100 text-red-600',
    Refunded: 'bg-red-100 text-red-600',
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        badgeStyles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {t(`dashboardOverview.transactionsLog.${status.toLowerCase()}`, status)}
    </span>
  );
};
