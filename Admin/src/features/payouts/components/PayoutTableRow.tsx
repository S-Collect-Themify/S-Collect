import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import type { PendingPayoutItem } from '../types';

interface PayoutTableRowProps {
  item: PendingPayoutItem;
  onRegisterPayout: (item: PendingPayoutItem) => void;
}

export default function PayoutTableRow({ item, onRegisterPayout }: PayoutTableRowProps) {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAdminProfile();

  const handleClick = () => {
    if (!isSuperAdmin) {
      toast.error(t('payouts.superAdminOnly', 'Restricted: Only Super Admin can register payouts.'));
      return;
    }
    onRegisterPayout(item);
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.vendorName || '--'}
      </td>
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.totalGmv != null ? item.totalGmv.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
        {item.commission != null ? item.commission.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
        {item.totalPayouts != null ? item.totalPayouts.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.pendingPayout != null ? item.pendingPayout.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-end whitespace-nowrap">
        <button
          type="button"
          onClick={handleClick}
          title={!isSuperAdmin ? t('payouts.superAdminOnly', 'Restricted: Only Super Admin can register payouts.') : undefined}
          className={`text-xs font-bold underline underline-offset-4 transition-colors ${
            !isSuperAdmin ? 'text-gray-400 opacity-60 cursor-not-allowed no-underline' : 'text-gray-900 hover:text-black cursor-pointer'
          }`}
        >
          {t('payouts.registerPayoutAction', 'Register Payout')}
        </button>
      </td>
    </tr>
  );
}
