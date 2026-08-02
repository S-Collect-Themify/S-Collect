import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown } from 'lucide-react';
import PortalDropdown from '../components/ui/PortalDropdown';
import {
  VendorReportHeader,
  VendorReportStatCards,
  VendorReportOrdersTable,
  STAT_CARDS_DATA,
  DATE_RANGES,
  useVendorReportOrders,
  useExportVendorReportMutation,
  type DateRangeKey,
} from '../features/vendorReports';

const ITEMS_PER_PAGE = 20;

export default function VendorReports() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [selectedRangeKey, setSelectedRangeKey] = useState<DateRangeKey>('last30Days');
  const [currentPage, setCurrentPage] = useState(1);

  // React Query for data fetching
  const { orders, totalOrdersCount, totalPages, isLoading } = useVendorReportOrders(
    currentPage,
    ITEMS_PER_PAGE
  );

  // React Mutation for report export actions
  const exportMutation = useExportVendorReportMutation();

  const currentOption = DATE_RANGES.find((r) => r.key === selectedRangeKey) || DATE_RANGES[1];

  const exportHeaders = [
    { key: 'id' as const, label: t('vendorReports.tableOrderNo', 'Order #') },
    { key: 'date' as const, label: t('vendorReports.tableDate', 'Date') },
    { key: 'amount' as const, label: t('vendorReports.tableAmount', 'Amount (SAR)') },
    { key: 'commission' as const, label: t('vendorReports.tableCommission', 'Commission (SAR)') },
    { key: 'net' as const, label: t('vendorReports.tableNet', 'Net (SAR)') },
    { key: 'status' as const, label: t('vendorReports.tableStatus', 'Status') },
  ];

  const handleExportExcel = () => {
    exportMutation.mutate({
      format: 'excel',
      fileName: `vendor_sales_report_${selectedRangeKey}`,
      title: t('vendorReports.title', 'Vendor Sales Report'),
      headers: exportHeaders,
      data: orders,
    });
  };

  const handleExportPDF = () => {
    exportMutation.mutate({
      format: 'pdf',
      fileName: `vendor_sales_report_${selectedRangeKey}`,
      title: t('vendorReports.title', 'Vendor Sales Report'),
      headers: exportHeaders,
      data: orders,
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50/60 min-h-screen font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Standardized Header Bar */}
      <VendorReportHeader
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content Area */}
      <main className="sidebar-page-container py-6 space-y-6">
        {/* Date Filter & Mobile Title Bar */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <h2 className="text-lg font-bold text-gray-900 md:hidden">
            {t('vendorReports.dashboard', 'Dashboard')}
          </h2>

          <PortalDropdown
            minWidth={160}
            align={isRtl ? 'left' : 'right'}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 z-50"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-2 h-9 px-3.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span>{t(`vendorReports.${currentOption.key}`, currentOption.defaultLabel)}</span>
                <ChevronDown
                  size={13}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                {DATE_RANGES.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setSelectedRangeKey(option.key);
                      setCurrentPage(1);
                      close();
                    }}
                    className={`w-full text-start px-4 py-2 text-xs transition-colors cursor-pointer ${
                      selectedRangeKey === option.key
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`vendorReports.${option.key}`, option.defaultLabel)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>
        </div>

        {/* 5 Stat Cards Grid */}
        <VendorReportStatCards cards={STAT_CARDS_DATA} />

        {/* Detailed Orders Table & Mobile List */}
        <VendorReportOrdersTable
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrdersCount={totalOrdersCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
