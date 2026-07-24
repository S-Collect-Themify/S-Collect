import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { VoucherItem } from '../types';

interface VoucherMobileListProps {
  vouchers: VoucherItem[];
  onDeleteClick: (voucher: VoucherItem) => void;
}

export const VoucherMobileList = ({
  vouchers,
  onDeleteClick,
}: VoucherMobileListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {vouchers.map((voucher) => (
        <div
          key={voucher.id}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          {/* Top Row: Code + Status Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-base">
              {voucher.code}
            </span>
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
          </div>

          {/* Key-Value Details List */}
          <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-xs text-gray-500">
            <span className="text-gray-400">{t('vouchersListing.table.type')}:</span>
            <span className="font-medium text-gray-800">{voucher.type}</span>

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
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/vouchers/edit/${voucher.id}`)}
              className="flex-1 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer"
            >
              {t('vouchersListing.actions.edit')}
            </button>
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
