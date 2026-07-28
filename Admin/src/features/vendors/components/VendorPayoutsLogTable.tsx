import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from './VendorDetailsCards';

interface PayoutItem {
  id: string;
  date: string;
  amount: number;
  status: string;
}

interface VendorPayoutsLogTableProps {
  vendorId: string;
  payouts: PayoutItem[];
  statusStyles: Record<string, { label: string; className: string }>;
}

export default function VendorPayoutsLogTable({
  vendorId,
  payouts,
  statusStyles,
}: VendorPayoutsLogTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-5 overflow-hidden border border-gray-100/80 shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100/70 border-b border-gray-100">
              <th className="px-6 py-3.5 text-start text-xs font-bold text-gray-900">
                {t('vendors.details.payoutsLog', 'Payouts Log')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.date', 'Date')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.amount', 'Amount')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.status', 'Status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-xs text-gray-400">
                  {t('vendors.details.noPayoutsYet', 'No payouts yet')}
                </td>
              </tr>
            ) : (
              payouts.slice(0, 5).map((payout) => {
                const style = statusStyles[payout.status] ?? {
                  label: payout.status,
                  className: 'bg-emerald-50 text-emerald-600',
                };
                return (
                  <tr
                    key={payout.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 text-amber-500 font-bold text-xs">{payout.id}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{payout.date}</td>
                    <td className="px-6 py-4 text-gray-900 text-xs font-bold">
                      SAR {payout.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="py-3 border-t border-gray-100 text-center">
          <Link
            to={`/vendors/${vendorId}/payouts`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('vendors.details.viewAllPayouts', 'View All Payouts')} →
          </Link>
        </div>
      </div>

      {/* Mobile Card List View (Sliced to 2 items) */}
      <div className="md:hidden p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          {t('vendors.details.payoutsLog', 'Payouts Log')}
        </h2>
        {payouts.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">
            {t('vendors.details.noPayoutsYet', 'No payouts yet')}
          </p>
        ) : (
          <div className="space-y-3">
            {payouts.slice(0, 2).map((payout) => {
              const style = statusStyles[payout.status] ?? {
                label: payout.status,
                className: 'bg-emerald-50 text-emerald-600',
              };
              return (
                <div
                  key={payout.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500">{payout.id}</span>
                    <span className="text-xs text-gray-400">{payout.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">
                      SAR {payout.amount.toLocaleString()}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 text-center">
              <Link
                to={`/vendors/${vendorId}/payouts`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('vendors.details.viewAllPayouts', 'View All Payouts')} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
