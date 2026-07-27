import { useTranslation } from 'react-i18next';
import type { PendingPayoutItem } from '../../types';

interface PayoutVendorSummaryBlockProps {
  item: PendingPayoutItem;
}

export default function PayoutVendorSummaryBlock({ item }: PayoutVendorSummaryBlockProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-sm py-1 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium">
          {t('payouts.vendorLabel', 'Vendor')}
        </span>
        <span className="font-bold text-gray-900">{item.vendorName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium">
          {t('payouts.bankAccountLabel', 'Bank Account')}
        </span>
        <span className="font-bold text-gray-900 text-xs sm:text-sm font-mono truncate max-w-50">
          {item.bankAccount}
        </span>
      </div>
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-gray-500 font-medium">
          {t('payouts.pendingPayoutLabel', 'Pending Payout')}
        </span>
        <span className="font-bold text-emerald-600">
          {item.pendingPayout.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          SAR
        </span>
      </div>
    </div>
  );
}
