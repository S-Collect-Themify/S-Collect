import React from 'react';
import { useTranslation } from 'react-i18next';

interface RefundFinancialSummaryCardProps {
  totalRefundAmount: number;
  reason?: string;
}

export const RefundFinancialSummaryCard: React.FC<RefundFinancialSummaryCardProps> = ({
  totalRefundAmount,
  reason,
}) => {
  const { t, i18n } = useTranslation();
  const currencySymbol = i18n.language === 'ar' ? '﷼' : 'SAR';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs">
      <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
        {t('refundDetails.financialSummary', 'Financial Summary')}
      </h2>
      <div className="space-y-2.5 sm:space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('refundDetails.requestedRefundAmount', 'Requested Refund Amount')}</span>
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            {(totalRefundAmount || 0).toFixed(2)} {currencySymbol}
          </span>
        </div>
        {reason && reason !== '--' && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-400 shrink-0">{t('refundDetails.reasonForRefund', 'Reason for Refund')}</span>
            <span className="text-gray-900 font-medium text-end">{reason}</span>
          </div>
        )}
      </div>
    </div>
  );
};
