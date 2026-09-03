import { useTranslation } from 'react-i18next';
import { STATUS_BADGE, type TransactionStatus } from './constants';

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const normalizedKey = status?.toUpperCase() || 'PENDING';
  const badgeClass =
    STATUS_BADGE[normalizedKey] ||
    STATUS_BADGE[status] ||
    'bg-gray-100 text-gray-700';

  const translationKey = `receivables.statuses.${status?.toLowerCase()}`;
  const label = t(translationKey, { defaultValue: status });

  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      {label}
    </span>
  );
}
