import { useTranslation } from 'react-i18next';
import type { PendingPayoutItem } from '../types';

interface PayoutMobileCardProps {
  item: PendingPayoutItem;
  onRegisterPayout: (item: PendingPayoutItem) => void;
}

export default function PayoutMobileCard({ item, onRegisterPayout }: PayoutMobileCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
      {/* Top Row: Vendor Name & Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold text-sm text-gray-900">{item.vendorName || '--'}</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
          {item.status || '--'}
        </span>
      </div>

      {/* Key-Value Details */}
      <div className="space-y-2 text-xs py-1 border-t border-b border-gray-50 my-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.totalGmvLabel', 'Total GMV')}
          </span>
          <span className="font-bold text-gray-900">
            {item.totalGmv != null ? `${item.totalGmv.toLocaleString()} SAR` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.commissionLabel', 'Commission')}
          </span>
          <span className="font-bold text-gray-900">
            {item.commission != null ? `${item.commission.toLocaleString()} SAR` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.totalPayoutsLabel', 'Total Payouts')}
          </span>
          <span className="font-bold text-gray-900">
            {item.totalPayouts != null ? `${item.totalPayouts.toLocaleString()} SAR` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-gray-900 font-bold">
            {t('payouts.pendingPayoutLabel', 'Pending Payout')}
          </span>
          <span className="font-extrabold text-gray-900">
            {item.pendingPayout != null ? `${item.pendingPayout.toLocaleString()} SAR` : '--'}
          </span>
        </div>
      </div>

      {/* Solid Black Register Payout Action Button */}
      <button
        type="button"
        onClick={() => onRegisterPayout(item)}
        className="w-full h-11 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        {t('payouts.registerPayoutAction', 'Register Payout')}
      </button>
    </div>
  );
}
