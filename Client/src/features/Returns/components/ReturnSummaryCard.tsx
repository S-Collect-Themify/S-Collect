import { useTranslation } from 'react-i18next';
import { type ReturnItem } from '../types';
import { StatusBadge } from './StatusBadge';

interface ReturnSummaryCardProps {
  item: ReturnItem;
}

export function ReturnSummaryCard({ item }: ReturnSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {t('returnsPage.returnSummary', { defaultValue: 'Return Summary' })}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-1">{t('returnsPage.returnId', { defaultValue: 'Return ID' })}</p>
          <p className="font-bold text-gray-900 font-mono text-sm sm:text-base">{item.id}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">{t('returnsPage.orderId', { defaultValue: 'Order ID' })}</p>
          <p className="font-semibold text-gray-700 font-mono">{item.orderId}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">{t('returnsPage.status', { defaultValue: 'Status' })}</p>
          <StatusBadge status={item.status} />
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">{t('returnsPage.requestedDate', { defaultValue: 'Request Date' })}</p>
          <p className="font-medium text-gray-800">{item.requestedDate}</p>
        </div>
      </div>
    </div>
  );
}
