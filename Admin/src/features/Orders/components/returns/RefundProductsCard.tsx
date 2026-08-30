import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminRefundItemProduct } from '../../../../services/refunds';

interface RefundProductsCardProps {
  items: AdminRefundItemProduct[];
}

export const RefundProductsCard: React.FC<RefundProductsCardProps> = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const currencySymbol = i18n.language === 'ar' ? '﷼' : 'SAR';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs">
      <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
        {t('refundDetails.productsRequestedRefund', 'Products Requested for Refund')}
      </h2>
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between text-xs border-t border-gray-100 pt-3.5 first:border-t-0 first:pt-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              {typeof it.thumbnailUrl === 'string' && it.thumbnailUrl ? (
                <img
                  src={it.thumbnailUrl}
                  alt={it.productNameSnapshot}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-lg">
                  📦
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                  {it.productNameSnapshot}
                </p>
                {Boolean(it.orderItemId) && (
                  <p className="text-gray-400 text-[11px] truncate">
                    Item ID: {it.orderItemId.slice(-6).toUpperCase()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 text-end shrink-0">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">{t('refundDetails.qty', 'QTY')}</p>
                <p className="font-bold text-gray-900 text-xs">1</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">{t('refundDetails.unitPrice', 'UNIT PRICE')}</p>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">
                  {(it.refundAmount || it.unitPriceSnapshot || 0).toFixed(2)} {currencySymbol}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
