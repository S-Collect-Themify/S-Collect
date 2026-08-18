import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { PendingPayoutItem } from '../../types';
import { useVendorBankInfo } from '../../hooks/usePayouts';

interface PayoutVendorSummaryBlockProps {
  item: PendingPayoutItem;
}

export default function PayoutVendorSummaryBlock({ item }: PayoutVendorSummaryBlockProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: bankInfo, isLoading } = useVendorBankInfo(item.id);

  const iban = bankInfo?.iban || (item.bankAccount !== '--' ? item.bankAccount : null);
  const bankName = bankInfo?.bankName;
  const holderName = bankInfo?.accountHolderName;

  return (
    <div className="space-y-2 text-sm py-1 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium">
          {t('payouts.vendorLabel', 'Vendor')}
        </span>
        <span className="font-bold text-gray-900">{item.vendorName}</span>
      </div>

      {holderName && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.accountHolderLabel', 'Account Holder')}
          </span>
          <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate max-w-50">
            {holderName}
          </span>
        </div>
      )}

      {bankName && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.bankNameLabel', 'Bank Name')}
          </span>
          <span className="font-semibold text-gray-900 text-xs sm:text-sm">
            {bankName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium">
          {t('payouts.ibanLabel', 'IBAN')}
        </span>
        <span className="font-bold text-gray-900 text-xs sm:text-sm font-mono tracking-wide select-all">
          {isLoading ? (
            <Loader2 className="animate-spin text-gray-400 inline" size={14} />
          ) : (
            iban || '--'
          )}
        </span>
      </div>

      <div className="flex items-center justify-between pt-0.5 border-t border-gray-100 mt-1">
        <span className="text-gray-500 font-medium">
          {t('payouts.pendingPayoutLabel', 'Pending Payout')}
        </span>
        <span className="font-bold text-emerald-600">
          {item.pendingPayout.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {isRtl ? '﷼' : 'SAR'}
        </span>
      </div>
    </div>
  );
}
