import React from 'react';
import { useTranslation } from 'react-i18next';

interface TransactionStatusBadgeProps {
  status: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const upper = (status || '').toUpperCase();

  let badgeStyle = 'bg-gray-100 text-gray-700';
  if (['PAID', 'CAPTURED', 'COMPLETED', 'DELIVERED'].includes(upper)) {
    badgeStyle = 'bg-green-100 text-green-700';
  } else if (['PENDING', 'UNPAID', 'PROCESSING'].includes(upper)) {
    badgeStyle = 'bg-amber-100 text-amber-700';
  } else if (['FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].includes(upper)) {
    badgeStyle = 'bg-red-100 text-red-600';
  }

  const displayKey = upper.toLowerCase();
  const defaultLabel = status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : 'Pending';

  const label = t(`dashboardOverview.transactionsLog.${displayKey}`, defaultLabel);

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeStyle}`}
    >
      {label}
    </span>
  );
};
