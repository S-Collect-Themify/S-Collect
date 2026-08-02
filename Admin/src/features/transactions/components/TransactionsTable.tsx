import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TransactionItem } from '../types/transaction.types';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionsTableProps {
  data: TransactionItem[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t('dashboardOverview.transactionsLog.orderNo', 'Order #')}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t('dashboardOverview.transactionsLog.date', 'Date')}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t('dashboardOverview.transactionsLog.buyerName', 'Buyer Name')}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t(
                'dashboardOverview.transactionsLog.totalAmount',
                'Total Amount (SAR)'
              )}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t(
                'dashboardOverview.transactionsLog.paymentMethod',
                'Payment Method'
              )}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t(
                'dashboardOverview.transactionsLog.paymentStatus',
                'Payment Status'
              )}
            </th>
            <th className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {t(
                'dashboardOverview.transactionsLog.myFatoorahRef',
                'MyFatoorah Ref #'
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                No transactions found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group"
              >
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono">
                  {item.orderNo || '--'}
                </td>
                <td className="py-3.5 px-4 text-gray-500 font-medium">
                  {item.date || '--'}
                </td>
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  {item.buyerName || '--'}
                </td>
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  {item.amount ? `${item.amount.toLocaleString()} SAR` : '--'}
                </td>
                <td className="py-3.5 px-4 text-gray-600 font-medium">
                  {item.paymentMethod || '--'}
                </td>
                <td className="py-3.5 px-4">
                  <TransactionStatusBadge status={item.status} />
                </td>
                <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                  {item.fatoorahRef || '--'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
