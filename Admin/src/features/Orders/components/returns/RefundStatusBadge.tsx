import React from 'react';
import { useTranslation } from 'react-i18next';

interface RefundStatusBadgeProps {
  status: string;
}

export const RefundStatusBadge: React.FC<RefundStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();
  const upper = (status || '').toUpperCase();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (['APPROVED', 'COMPLETED'].includes(upper)) {
    badgeStyle = 'bg-emerald-100/80 text-emerald-700';
  } else if (['REJECTED', 'CANCELED', 'CANCELLED'].includes(upper)) {
    badgeStyle = 'bg-rose-100/80 text-rose-700';
  } else if (['PENDING', 'PENDING_REVIEW'].includes(upper)) {
    badgeStyle = 'bg-amber-100/80 text-amber-800';
  }

  return (
    <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold ${badgeStyle}`}>
      {t(`ordersPage.statuses.${status}`, status)}
    </span>
  );
};
