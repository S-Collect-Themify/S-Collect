import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';
import type { VoucherItem } from '../types';

interface VoucherTableProps {
  vouchers: VoucherItem[];
  onDeleteClick: (voucher: VoucherItem) => void;
  onDeactivateClick?: (voucher: VoucherItem) => void;
}

interface CategoryRef {
  id?: string;
  _id?: string;
  name?: string | { en?: string; ar?: string };
  nameEn?: string;
  nameAr?: string;
  name_en?: string;
  name_ar?: string;
}

const renderCategoryBadges = (
  catData: unknown,
  categoriesList: CategoryRef[],
  language: string
) => {
  const catArray: string[] = Array.isArray(catData)
    ? catData.map((c) => String(c).trim()).filter(Boolean)
    : typeof catData === 'string' && catData.trim()
    ? catData.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  if (catArray.length === 0) {
    return <span className="text-gray-400 font-normal">—</span>;
  }

  const getCatName = (idOrCat: string): string => {
    const found = categoriesList.find(
      (c) => String(c.id || c._id) === String(idOrCat) || String(c.name) === String(idOrCat)
    );
    if (found) {
      const nameObj = typeof found.name === 'object' && found.name !== null ? found.name : null;
      const strName = typeof found.name === 'string' ? found.name : '';
      if (language === 'ar') {
        return found.nameAr || found.name_ar || nameObj?.ar || found.nameEn || strName || idOrCat;
      }
      return found.nameEn || found.name_en || nameObj?.en || found.nameAr || strName || idOrCat;
    }
    return idOrCat;
  };

  const resolvedNames = catArray.map(getCatName);
  const firstCat = resolvedNames[0];
  const extraCount = resolvedNames.length - 1;
  const fullTooltip = resolvedNames.join(', ');

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

export const VoucherTable = ({
  vouchers,
  onDeleteClick,
  onDeactivateClick,
}: VoucherTableProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useCategories();

  const formatScope = (scope?: string) => {
    if (!scope) return '—';
    if (scope === 'SPECIFIC_CATEGORIES' || scope === 'Category') {
      return t('vouchersListing.scopes.specificCategories', { defaultValue: 'Specific Categories' });
    }
    if (scope === 'ALL_ORDERS' || scope === 'All') {
      return t('vouchersListing.scopes.allOrders', { defaultValue: 'All Orders' });
    }
    return scope;
  };

  const formatType = (type?: string) => {
    if (!type) return '—';
    if (type === 'FIXED_AMOUNT' || type === 'Amount') {
      return t('vouchersListing.types.amount', { defaultValue: 'Amount' });
    }
    if (type === 'PERCENTAGE' || type === 'Percentage') {
      return t('vouchersListing.types.percentage', { defaultValue: 'Percentage' });
    }
    return type;
  };

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
                {renderCategoryBadges(voucher.category, categories, i18n.language)}
              </td>

              {/* Scope */}
              <td className="py-3.5 px-3.5 text-gray-700 font-medium whitespace-nowrap">
                {formatScope(voucher.scope)}
              </td>

              {/* Voucher Type */}
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
                {formatType(voucher.type)}
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
              <td className="py-3.5 px-3.5 text-gray-700 whitespace-nowrap">
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

              {/* Actions: Edit, Deactivate & Delete */}
              <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-2.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => navigate(`/vouchers/edit/${voucher.id}`)}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    {t('vouchersListing.actions.edit')}
                  </button>
                  {voucher.status === 'Active' && onDeactivateClick && (
                    <button
                      type="button"
                      onClick={() => onDeactivateClick(voucher)}
                      className="text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      {t('vouchersListing.actions.deactivate')}
                    </button>
                  )}
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
