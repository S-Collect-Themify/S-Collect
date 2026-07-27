import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import type { TransactionItem } from '../types/transaction.types';

interface TransactionsHeaderProps {
  filteredTransactions: TransactionItem[];
}

export const TransactionsHeader: React.FC<TransactionsHeaderProps> = ({
  filteredTransactions,
}) => {
  const { t } = useTranslation();

  const exportHeaders = [
    { key: 'orderNo' as const, label: t('dashboardOverview.transactionsLog.orderNo', 'Order #') },
    { key: 'date' as const, label: t('dashboardOverview.transactionsLog.date', 'Date') },
    { key: 'buyerName' as const, label: t('dashboardOverview.transactionsLog.buyerName', 'Buyer Name') },
    { key: 'amount' as const, label: t('dashboardOverview.transactionsLog.totalAmount', 'Total Amount') },
    { key: 'paymentMethod' as const, label: t('dashboardOverview.transactionsLog.paymentMethod', 'Payment Method') },
    { key: 'status' as const, label: t('dashboardOverview.transactionsLog.paymentStatus', 'Payment Status') },
    { key: 'fatoorahRef' as const, label: t('dashboardOverview.transactionsLog.myFatoorahRef', 'MyFatoorah Ref #') },
  ];

  const handleExportExcel = () => {
    exportToCSV('Transactions_Log', exportHeaders, filteredTransactions);
    toast.success(t('dashboardOverview.transactionsLog.exportSuccess', 'File exported successfully!'));
  };

  const handleExportPDF = () => {
    exportToPDF(
      t('dashboardOverview.transactionsLog.title', 'Transactions Log'),
      exportHeaders,
      filteredTransactions
    );
  };

  return (
    <div className="sidebar-page-container-header">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('dashboardOverview.transactionsLog.title', 'Transactions Log')}
          </h1>
        </div>

        {/* Export Dropdown */}
        <PortalDropdown
          minWidth={185}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-950 text-white text-xs sm:text-label-md font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Download size={16} />
              <span>{t('dashboardOverview.transactionsLog.export', 'Export')}</span>
            </button>
          )}
        >
          {({ close }) => (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  handleExportExcel();
                  close();
                }}
                className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={15} className="text-green-600" />
                <span>
                  {t(
                    'dashboardOverview.transactionsLog.exportExcel',
                    'Export as Excel (.csv)'
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExportPDF();
                  close();
                }}
                className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FileText size={15} className="text-red-500" />
                <span>
                  {t(
                    'dashboardOverview.transactionsLog.exportPdf',
                    'Export as PDF (.pdf)'
                  )}
                </span>
              </button>
            </div>
          )}
        </PortalDropdown>
      </div>
    </div>
  );
};
