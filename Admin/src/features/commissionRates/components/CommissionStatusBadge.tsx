import { useTranslation } from 'react-i18next';
import type { CommissionStatus } from '../types';

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
}

export default function CommissionStatusBadge({ status }: CommissionStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === 'Custom') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100/50">
        {t('commissionRates.statusCustom', 'Custom')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100/50">
      {t('commissionRates.statusDefault', 'Default')}
    </span>
  );
}
