import { useTranslation } from 'react-i18next';
import type { PendingPayoutItem } from '../types';
import PayoutTableSkeleton from './skeletons/PayoutTableSkeleton';
import PayoutTableRow from './PayoutTableRow';

interface PayoutsDesktopTableProps {
  items: PendingPayoutItem[];
  onRegisterPayout: (item: PendingPayoutItem) => void;
  isLoading?: boolean;
}

export default function PayoutsDesktopTable({
  items,
  onRegisterPayout,
  isLoading = false,
}: PayoutsDesktopTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-start border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-700 text-xs font-bold">
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('payouts.vendorName', 'Vendor Name')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('payouts.totalGmv', 'Total GMV (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('payouts.commission', 'Commission (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('payouts.totalPayouts', 'Total Payouts (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('payouts.pendingPayout', 'Pending Payout (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-end font-bold text-gray-800">
              {t('payouts.actions', 'Actions')}
            </th>
          </tr>
        </thead>
        {isLoading ? (
          <PayoutTableSkeleton rowCount={6} />
        ) : items.length === 0 ? (
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                No pending payouts found.
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <PayoutTableRow
                key={item.id}
                item={item}
                onRegisterPayout={onRegisterPayout}
              />
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
