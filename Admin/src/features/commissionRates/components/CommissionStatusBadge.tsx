import { useTranslation } from 'react-i18next';
import type { CommissionStatus } from '../types';

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
}

export default function CommissionStatusBadge({ status }: CommissionStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === 'Custom') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100/80">
        {t('commissionRates.statusCustom', 'Custom')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100/80">
      {t('commissionRates.statusDefault', 'Default')}
    </span>
  );
}

