import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import {
  getAdminTransactions,
  mapBackendTransactionToUI,
  type GetAdminTransactionsParams,
} from '../../../services/transactions';
import type { TransactionItem } from '../types/transaction.types';

interface TransactionsHeaderProps {
  filteredTransactions: TransactionItem[];
  filterParams?: GetAdminTransactionsParams;
}

export const TransactionsHeader: React.FC<TransactionsHeaderProps> = ({
  filteredTransactions,
  filterParams,
}) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportHeaders = [
    { key: 'orderNo' as const, label: t('dashboardOverview.transactionsLog.orderNo', 'Order #') },
    { key: 'date' as const, label: t('dashboardOverview.transactionsLog.date', 'Date') },
    { key: 'buyerName' as const, label: t('dashboardOverview.transactionsLog.buyerName', 'Buyer Name') },
    { key: 'amount' as const, label: t('dashboardOverview.transactionsLog.totalAmount', 'Total Amount') },
    { key: 'paymentMethod' as const, label: t('dashboardOverview.transactionsLog.paymentMethod', 'Payment Method') },
    { key: 'status' as const, label: t('dashboardOverview.transactionsLog.paymentStatus', 'Payment Status') },
    { key: 'fatoorahRef' as const, label: t('dashboardOverview.transactionsLog.myFatoorahRef', 'MyFatoorah Ref #') },
  ];

  const fetchAllMatchingTransactions = async (): Promise<TransactionItem[]> => {
    try {
      // 1. Fetch page 1 with 100 items per page
      const firstPageRes = await getAdminTransactions({
        ...filterParams,
        pageNum: 1,
        pageSize: 100,
      });

      let allItems = [...(firstPageRes.items || [])];
      const totalPages = firstPageRes.pagination?.totalPages ?? 1;

      // 2. If there are additional pages, fetch them all in parallel
      if (totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= totalPages; p++) {
          pagePromises.push(
            getAdminTransactions({
              ...filterParams,
              pageNum: p,
              pageSize: 100,
            })
          );
        }
        const remainingPagesRes = await Promise.all(pagePromises);
        for (const res of remainingPagesRes) {
          if (res.items && res.items.length > 0) {
            allItems = allItems.concat(res.items);
          }
        }
      }

      const mapped = allItems.map(mapBackendTransactionToUI);
      return mapped.length > 0 ? mapped : filteredTransactions;
    } catch (err) {
      console.error('Failed to fetch all transactions for export:', err);
      return filteredTransactions;
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const dataToExport = await fetchAllMatchingTransactions();
      exportToCSV('Transactions_Log', exportHeaders, dataToExport);
      toast.success(t('dashboardOverview.transactionsLog.exportSuccess', 'File exported successfully!'));
    } catch {
      toast.error('Failed to export transactions.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const dataToExport = await fetchAllMatchingTransactions();
      exportToPDF(
        t('dashboardOverview.transactionsLog.title', 'Transactions Log'),
        exportHeaders,
        dataToExport
      );
    } catch {
      toast.error('Failed to export transactions.');
    } finally {
      setIsExporting(false);
    }
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
              disabled={isExporting}
              onClick={toggle}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-950 text-white text-xs sm:text-label-md font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{t('dashboardOverview.transactionsLog.export', 'Export')}</span>
            </button>
          )}
        >
          {({ close }) => (
            <div className="py-1">
              <button
                type="button"
                disabled={isExporting}
                onClick={async () => {
                  close();
                  await handleExportExcel();
                }}
                className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
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
                disabled={isExporting}
                onClick={async () => {
                  close();
                  await handleExportPDF();
                }}
                className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
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
