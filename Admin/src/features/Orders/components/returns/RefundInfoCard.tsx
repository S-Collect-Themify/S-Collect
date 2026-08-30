import React from 'react';
import { useTranslation } from 'react-i18next';

interface RefundInfoCardProps {
  orderIdCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const RefundInfoCard: React.FC<RefundInfoCardProps> = ({
  orderIdCode,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs">
      <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
        {t('refundDetails.orderCustomerInfo', 'Order & Customer Info')}
      </h2>
      <div className="space-y-2.5 sm:space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('refundDetails.orderId', 'Order ID')}</span>
          <span className="font-bold text-gray-900 font-mono">{orderIdCode}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('refundDetails.customerName', 'Customer Name')}</span>
          <span className="font-bold text-gray-900">{customerName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('refundDetails.emailAddress', 'Email Address')}</span>
          {customerEmail !== '--' ? (
            <a href={`mailto:${customerEmail}`} className="text-blue-600 font-medium hover:underline">
              {customerEmail}
            </a>
          ) : (
            <span className="text-gray-700 font-medium">--</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('refundDetails.phoneNumber', 'Phone Number')}</span>
          <span className="text-gray-900 font-medium">{customerPhone}</span>
        </div>
      </div>
    </div>
  );
};
