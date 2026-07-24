import { useTranslation } from 'react-i18next';
import { type ReturnItem } from '../types';

interface ReturnProductInfoCardProps {
  item: ReturnItem;
}

export function ReturnProductInfoCard({ item }: ReturnProductInfoCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {t('returnsPage.productInformation', { defaultValue: 'Product Information' })}
      </h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <img
          src={item.productImage}
          alt={item.productTitle}
          className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1.5">{item.productTitle}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>SKU: <strong className="text-gray-700">{item.productSku}</strong></span>
            <span>•</span>
            <span>Variant: <strong className="text-gray-700">{item.productVariant}</strong></span>
            <span>•</span>
            <span>Qty: <strong className="text-gray-700">{item.productQty}</strong></span>
            <span>•</span>
            <span className="font-bold text-gray-900 text-base">{item.productPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
