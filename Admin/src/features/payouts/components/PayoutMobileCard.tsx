import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import type { PendingPayoutItem } from '../types';

interface PayoutMobileCardProps {
  item: PendingPayoutItem;
  onRegisterPayout: (item: PendingPayoutItem) => void;
}

export default function PayoutMobileCard({ item, onRegisterPayout }: PayoutMobileCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const currencySymbol = isRtl ? '﷼' : 'SAR';
  const { isSuperAdmin } = useAdminProfile();

  const handleClick = () => {
    if (!isSuperAdmin) {
      toast.error(t('payouts.superAdminOnly', 'Restricted: Only Super Admin can register payouts.'));
      return;
    }
    onRegisterPayout(item);
  };

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
            {item.totalGmv != null ? `${item.totalGmv.toLocaleString()} ${currencySymbol}` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.commissionLabel', 'Commission')}
          </span>
          <span className="font-bold text-gray-900">
            {item.commission != null ? `${item.commission.toLocaleString()} ${currencySymbol}` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            {t('payouts.totalPayoutsLabel', 'Total Payouts')}
          </span>
          <span className="font-bold text-gray-900">
            {item.totalPayouts != null ? `${item.totalPayouts.toLocaleString()} ${currencySymbol}` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-gray-900 font-bold">
            {t('payouts.pendingPayoutLabel', 'Pending Payout')}
          </span>
          <span className="font-extrabold text-gray-900">
            {item.pendingPayout != null ? `${item.pendingPayout.toLocaleString()} ${currencySymbol}` : '--'}
          </span>
        </div>
      </div>

      {/* Solid Black Register Payout Action Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!isSuperAdmin}
        className={`w-full h-11 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center ${
          !isSuperAdmin
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 cursor-pointer active:scale-95'
        }`}
      >
        {t('payouts.registerPayoutAction', 'Register Payout')}
      </button>
    </div>
  );
}
