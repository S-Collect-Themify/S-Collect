import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { VoucherItem } from '../types';

interface VoucherTableProps {
  vouchers: VoucherItem[];
  onDeleteClick: (voucher: VoucherItem) => void;
}

export const VoucherTable = ({ vouchers, onDeleteClick }: VoucherTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse rtl:text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-800">
            <th className="py-4 px-6">{t('vouchersListing.table.code')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.type')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.discount')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.minOrder')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.maxDiscount')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.usage')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.expiryDate')}</th>
            <th className="py-4 px-6">{t('vouchersListing.table.status')}</th>
            <th className="py-4 px-6 text-center">{t('vouchersListing.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {vouchers.map((voucher) => (
            <tr
              key={voucher.id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              {/* Voucher Code */}
              <td className="py-4 px-6 font-semibold text-gray-900">
                {voucher.code}
              </td>

              {/* Voucher Type */}
              <td className="py-4 px-6 text-gray-700">{voucher.type}</td>

              {/* Discount */}
              <td className="py-4 px-6 font-medium text-gray-900">
                {voucher.discount}
              </td>

              {/* Min Order */}
              <td className="py-4 px-6 text-gray-700">{voucher.minOrder}</td>

              {/* Max Discount */}
              <td className="py-4 px-6 text-gray-700">{voucher.maxDiscount}</td>

              {/* Usage */}
              <td className="py-4 px-6 text-gray-700">{voucher.usage}</td>

              {/* Expiry Date */}
              <td className="py-4 px-6 text-gray-500">{voucher.expiryDate}</td>

              {/* Status Badge */}
              <td className="py-4 px-6">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    voucher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  {voucher.status === 'Active'
                    ? t('vouchersListing.statuses.active')
                    : t('vouchersListing.statuses.expired')}
                </span>
              </td>

              {/* Actions: Edit & Delete */}
              <td className="py-4 px-6 text-center">
                <div className="flex items-center justify-center gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => navigate(`/vouchers/edit/${voucher.id}`)}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    {t('vouchersListing.actions.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(voucher)}
                    className="text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    {t('vouchersListing.actions.delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {vouchers.length === 0 && (
            <tr>
              <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                {t('vouchersListing.emptyState.title')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
