import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TransactionItem } from '../types/transaction.types';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionsMobileListProps {
  data: TransactionItem[];
}

export const TransactionsMobileList: React.FC<TransactionsMobileListProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="md:hidden space-y-3 p-3 bg-gray-50/50">
      {data.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
          No transactions found.
        </div>
      ) : (
        data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5 shadow-2xs hover:border-gray-200 transition-colors"
          >
            {/* Top Row: Order # & Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 font-mono">
                {item.orderNo}
              </span>
              <TransactionStatusBadge status={item.status} />
            </div>

            {/* Detail Rows */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  {t('dashboardOverview.transactionsLog.buyerName', 'Buyer Name')}
                </span>
                <span className="font-bold text-gray-900">{item.buyerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  {t('dashboardOverview.transactionsLog.totalAmount', 'Total Amount')}
                </span>
                <span className="font-bold text-gray-900">
                  {item.amount.toLocaleString()} SAR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  {t('dashboardOverview.transactionsLog.methodAndDate', 'Method & Date')}
                </span>
                <span className="font-medium text-gray-800">
                  {item.paymentMethod} • {item.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  {t('dashboardOverview.transactionsLog.myFatoorahRef', 'MyFatoorah Ref')}
                </span>
                <span className="font-mono text-gray-500">{item.fatoorahRef}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
