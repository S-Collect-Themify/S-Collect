import { useTranslation } from 'react-i18next';
import { type ReturnItem } from '../types';

interface ReturnCustomerInfoCardProps {
  item: ReturnItem;
}

export function ReturnCustomerInfoCard({ item }: ReturnCustomerInfoCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
      <h2 className="text-base font-bold text-gray-900">
        {t('returnsPage.customerInformation', { defaultValue: 'Customer Information' })}
      </h2>
      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Name</span>
          <span className="font-bold text-gray-900">{item.customerName}</span>
        </div>
        {item.customerEmail && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">{t('returnsPage.email', { defaultValue: 'Email' })}</span>
            <span className="font-semibold text-gray-800 font-mono">{item.customerEmail}</span>
          </div>
        )}
        {item.customerPhone && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">{t('returnsPage.phone', { defaultValue: 'Phone' })}</span>
            <span className="font-semibold text-gray-800 dir-ltr">{item.customerPhone}</span>
          </div>
        )}
        {item.shippingAddress && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-gray-400 font-medium block mb-1">{t('returnsPage.shippingAddress', { defaultValue: 'Shipping Address' })}</span>
            <p className="text-gray-700 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
              {item.shippingAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
