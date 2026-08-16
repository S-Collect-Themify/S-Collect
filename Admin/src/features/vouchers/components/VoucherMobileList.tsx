import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';
import type { VoucherItem } from '../types';

interface VoucherMobileListProps {
  vouchers: VoucherItem[];
  onDeleteClick: (voucher: VoucherItem) => void;
  onDeactivateClick?: (voucher: VoucherItem) => void;
}

const renderCategoryBadges = (catData: any, categoriesList: any[], language: string) => {
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
      if (language === 'ar') {
        return found.nameAr || found.name_ar || found.name?.ar || found.nameEn || found.name || idOrCat;
      }
      return found.nameEn || found.name_en || found.name?.en || found.nameAr || found.name || idOrCat;
    }
    return idOrCat;
  };

  const resolvedNames = catArray.map(getCatName);
  const firstCat = resolvedNames[0];
  const extraCount = resolvedNames.length - 1;
  const fullTooltip = resolvedNames.join(', ');

  return (
    <div className="flex items-center gap-1.5 flex-wrap" title={fullTooltip}>
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium border border-gray-200 truncate max-w-[120px]">
        {firstCat}
      </span>
      {extraCount > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold border border-gray-900 shrink-0">
          +{extraCount}
        </span>
      )}
    </div>
  );
};

export const VoucherMobileList = ({
  vouchers,
  onDeleteClick,
  onDeactivateClick,
}: VoucherMobileListProps) => {
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
    <div className="space-y-3">
      {vouchers.map((voucher) => (
        <div
          key={voucher.id}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          {/* Top Row: Code + Status Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-2.5 py-1 rounded-xl bg-gray-900 text-white font-mono text-xs font-bold tracking-wide shadow-2xs">
              {voucher.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                voucher.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : voucher.status === 'Limit Reached'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  voucher.status === 'Active'
                    ? 'bg-emerald-500'
                    : voucher.status === 'Limit Reached'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              {voucher.status === 'Active'
                ? t('vouchersListing.statuses.active')
                : voucher.status === 'Limit Reached'
                ? t('vouchersListing.statuses.reachedLimit', { defaultValue: 'Reached Limit' })
                : t('vouchersListing.statuses.expired')}
            </span>
          </div>

          {/* Key-Value Details List */}
          <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-xs text-gray-500 items-center">
            <span className="text-gray-400">{t('vouchersListing.table.category')}:</span>
            <span className="font-medium text-gray-800">
              {renderCategoryBadges(voucher.category, categories, i18n.language)}
            </span>

            <span className="text-gray-400">{t('vouchersListing.table.scope')}:</span>
            <span className="font-medium text-gray-800">{formatScope(voucher.scope)}</span>

            <span className="text-gray-400">{t('vouchersListing.table.type')}:</span>
            <span className="font-medium text-gray-800">{formatType(voucher.type)}</span>


            <span className="text-gray-400">{t('vouchersListing.table.discount')}:</span>
            <span className="font-medium text-gray-800">{voucher.discount}</span>

            <span className="text-gray-400">{t('vouchersListing.table.minOrder')}:</span>
            <span className="font-medium text-gray-800">{voucher.minOrder}</span>

            <span className="text-gray-400">{t('vouchersListing.table.maxDiscount')}:</span>
            <span className="font-medium text-gray-800">{voucher.maxDiscount}</span>

            <span className="text-gray-400">{t('vouchersListing.table.usage')}:</span>
            <span className="font-medium text-gray-800">{voucher.usage}</span>

            <span className="text-gray-400">{t('vouchersListing.table.expiryDate')}:</span>
            <span className="font-medium text-gray-800">{voucher.expiryDate}</span>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/vouchers/edit/${voucher.id}`)}
              className="flex-1 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer"
            >
              {t('vouchersListing.actions.edit')}
            </button>
            {voucher.status === 'Active' && onDeactivateClick && (
              <button
                type="button"
                onClick={() => onDeactivateClick(voucher)}
                className="flex-1 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors text-center cursor-pointer"
              >
                {t('vouchersListing.actions.deactivate')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDeleteClick(voucher)}
              className="flex-1 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-center cursor-pointer"
            >
              {t('vouchersListing.actions.delete')}
            </button>
          </div>
        </div>
      ))}

      {vouchers.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 text-sm">
          {t('vouchersListing.emptyState.title')}
        </div>
      )}
    </div>
  );
};
