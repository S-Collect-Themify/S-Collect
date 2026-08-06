import { useTranslation } from 'react-i18next';
import type { PendingPayoutItem } from '../types';

interface PayoutTableRowProps {
  item: PendingPayoutItem;
  onRegisterPayout: (item: PendingPayoutItem) => void;
}

export default function PayoutTableRow({ item, onRegisterPayout }: PayoutTableRowProps) {
  const { t } = useTranslation();

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.vendorName || '--'}
      </td>
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.totalGmv != null ? item.totalGmv.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">
        {item.commission != null ? item.commission.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">
        {item.totalPayouts != null ? item.totalPayouts.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
        {item.pendingPayout != null ? item.pendingPayout.toLocaleString() : '--'}
      </td>
      <td className="px-5 py-4 text-end whitespace-nowrap">
        <button
          type="button"
          onClick={() => onRegisterPayout(item)}
          className="text-xs font-bold text-gray-900 underline underline-offset-4 hover:text-black cursor-pointer transition-colors"
        >
          {t('payouts.registerPayoutAction', 'Register Payout')}
        </button>
      </td>
    </tr>
  );
}
