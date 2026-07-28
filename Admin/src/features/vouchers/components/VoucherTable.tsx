import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { VoucherItem } from '../types';

interface VoucherTableProps {
  vouchers: VoucherItem[];
  onDeleteClick: (voucher: VoucherItem) => void;
}

const renderCategoryBadges = (catData: any) => {
  const catArray: string[] = Array.isArray(catData)
    ? catData.map((c) => String(c).trim()).filter(Boolean)
    : typeof catData === 'string' && catData.trim()
    ? catData.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  if (catArray.length === 0) {
    return <span className="text-gray-400 font-normal">—</span>;
  }

  const firstCat = catArray[0];
  const extraCount = catArray.length - 1;
  const fullTooltip = catArray.join(', ');

  return (
    <div className="flex items-center gap-1 flex-wrap" title={fullTooltip}>
      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200/80 truncate max-w-30">
        {firstCat}
      </span>
      {extraCount > 0 && (
        <span
          className="inline-block px-1.5 py-0.5 rounded bg-gray-200/70 text-gray-700 text-[11px] font-bold border border-gray-300/60 cursor-help"
          title={fullTooltip}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
};

export const VoucherTable = ({ vouchers, onDeleteClick }: VoucherTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse rtl:text-right text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-200 font-semibold text-gray-800">
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.code')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.category')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.scope')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.type')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.discount')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.minOrder')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.maxDiscount')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.usage')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.expiryDate')}</th>
            <th className="py-3.5 px-3.5">{t('vouchersListing.table.status')}</th>
            <th className="py-3.5 px-3.5 text-center">{t('vouchersListing.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vouchers.map((voucher) => (
            <tr
              key={voucher.id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              {/* Voucher Code */}
              <td className="py-3.5 px-3.5 font-bold text-gray-900 whitespace-nowrap">
                {voucher.code}
              </td>

              {/* Category Badges */}
              <td className="py-3.5 px-3.5">
                {renderCategoryBadges(voucher.category)}
              </td>

              {/* Scope */}
              <td className="py-3.5 px-3.5 text-gray-700 font-medium whitespace-nowrap">
                {voucher.scope || '—'}
              </td>

              {/* Voucher Type */}
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
                {voucher.type}
              </td>

              {/* Discount */}
              <td className="py-3.5 px-3.5 font-semibold text-gray-900 whitespace-nowrap">
                {voucher.discount}
              </td>

              {/* Min Order */}
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
                {voucher.minOrder || '—'}
              </td>

              {/* Max Discount */}
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
                {voucher.maxDiscount || '—'}
              </td>

              {/* Usage */}
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
                {voucher.usage || '—'}
              </td>

              {/* Expiry Date */}
              <td className="py-3.5 px-3.5 text-gray-500 whitespace-nowrap">
                {voucher.expiryDate || '—'}
              </td>

              {/* Status Badge */}
              <td className="py-3.5 px-3.5 whitespace-nowrap">
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
              <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-2.5 text-xs font-semibold">
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
              <td colSpan={11} className="py-12 text-center text-gray-400 text-sm">
                {t('vouchersListing.emptyState.title')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
