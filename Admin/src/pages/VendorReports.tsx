import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  VendorReportHeader,
  VendorReportStatCards,
  VendorReportOrdersTable,
  VendorReportVendorDropdown,
  VendorReportDateFilter,
  getDateRangeStrings,
  useVendorSalesReportSummary,
  useVendorReportOrders,
  useExportVendorReportMutation,
  type DateRangeKey,
} from '../features/vendorReports';
import { useVendors } from '../features/vendors/hooks/useVendors';

const ITEMS_PER_PAGE = 20;

export default function VendorReports() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // ── Fetch Vendors for Filter ──────────────────────────────────────────────
  const { data: vendors = [], isLoading: isVendorsLoading } = useVendors();
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  const [selectedRangeKey, setSelectedRangeKey] = useState<DateRangeKey>('last30Days');
  const [customRange, setCustomRange] = useState<{ dateFrom: string; dateTo: string }>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
    };
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate ISO date strings dateFrom & dateTo
  const { dateFrom, dateTo } = useMemo(
    () => getDateRangeStrings(selectedRangeKey, customRange),
    [selectedRangeKey, customRange]
  );

  // ── React Query for vendor-sales-report/summary ───────────────────────────
  const { data: summaryData } = useVendorSalesReportSummary(
    dateFrom,
    dateTo,
    selectedVendorId || undefined
  );

  // ── React Query for vendor-sales-report/orders ────────────────────────────
  const { orders, totalOrdersCount, totalPages, isLoading: isOrdersLoading } = useVendorReportOrders(
    dateFrom,
    dateTo,
    selectedVendorId || undefined,
    currentPage,
    ITEMS_PER_PAGE
  );

  // React Mutation for report export actions
  const exportMutation = useExportVendorReportMutation();

  // Dynamic stat cards based on GET /api/v1/admin/vendor-sales-report/summary
  const dynamicStatCards = useMemo(() => {
    const formatVal = (val: number | undefined | null) =>
      selectedVendorId && val != null
        ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '--';

    return [
      {
        id: 'gmv',
        titleKey: 'vendorGmv',
        defaultTitle: 'Vendor GMV',
        value: formatVal(summaryData?.vendorGmv),
        currency: 'SAR',
        iconName: 'gmv' as const,
      },
      {
        id: 'commission',
        titleKey: 'platformCommission',
        defaultTitle: 'Platform Commission',
        value: formatVal(summaryData?.platformCommission),
        currency: 'SAR',
        iconName: 'commission' as const,
      },
      {
        id: 'payouts',
        titleKey: 'totalPayouts',
        defaultTitle: 'Total Payouts',
        value: formatVal(summaryData?.totalPayouts),
        currency: 'SAR',
        iconName: 'payouts' as const,
      },
      {
        id: 'net',
        titleKey: 'netVendorPayable',
        defaultTitle: 'Net Vendor Payable',
        value: formatVal(summaryData?.netVendorPayable),
        currency: 'SAR',
        iconName: 'net' as const,
      },
      {
        id: 'pending',
        titleKey: 'pendingPayout',
        defaultTitle: 'Pending Payout',
        value: formatVal(summaryData?.pendingPayout),
        currency: 'SAR',
        iconName: 'pending' as const,
      },
    ];
  }, [summaryData, selectedVendorId]);

  const exportHeaders = [
    { key: 'id' as const, label: t('vendorReports.tableOrderNo', 'Order #') },
    { key: 'date' as const, label: t('vendorReports.tableDate', 'Date') },
    { key: 'amount' as const, label: t('vendorReports.tableAmount', 'Amount (SAR)') },
    { key: 'commission' as const, label: t('vendorReports.tableCommission', 'Commission (SAR)') },
    { key: 'net' as const, label: t('vendorReports.tableNet', 'Net (SAR)') },
    { key: 'status' as const, label: t('vendorReports.tableStatus', 'Status') },
  ];

  const summaryStatsForExport = useMemo(() => {
    return dynamicStatCards.map((card) => ({
      label: t(`vendorReports.${card.titleKey}`, card.defaultTitle),
      value: `${card.value} ${t('vendorReports.currency', card.currency)}`,
    }));
  }, [dynamicStatCards, t]);

  const handleExportExcel = () => {
    if (!selectedVendorId) {
      toast.error(t('vendorReports.noVendorSelected', 'Please select a vendor to view report'));
      return;
    }
    exportMutation.mutate({
      format: 'excel',
      fileName: `vendor_sales_report_${selectedVendorId}_${selectedRangeKey}`,
      title: t('vendorReports.title', 'Vendor Sales Report'),
      headers: exportHeaders,
      dateFrom,
      dateTo,
      vendorId: selectedVendorId,
      summaryStats: summaryStatsForExport,
    });
  };

  const handleExportPDF = () => {
    if (!selectedVendorId) {
      toast.error(t('vendorReports.noVendorSelected', 'Please select a vendor to view report'));
      return;
    }
    exportMutation.mutate({
      format: 'pdf',
      fileName: `vendor_sales_report_${selectedVendorId}_${selectedRangeKey}`,
      title: t('vendorReports.title', 'Vendor Sales Report'),
      headers: exportHeaders,
      dateFrom,
      dateTo,
      vendorId: selectedVendorId,
      summaryStats: summaryStatsForExport,
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
        isExporting={exportMutation.isPending}
      />

      {/* Main Content Area */}
      <main className="sidebar-page-container py-6 space-y-6">
        {/* Filters Bar: Vendor Filter Dropdown + Date Range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
              {t('vendorReports.vendorFilter', 'Vendor Name')}:
            </span>
            <VendorReportVendorDropdown
              vendors={vendors}
              selectedVendorId={selectedVendorId}
              onSelectVendor={(id) => {
                setSelectedVendorId(id);
                setCurrentPage(1);
              }}
              isLoading={isVendorsLoading}
            />
          </div>

          <VendorReportDateFilter
            selectedRangeKey={selectedRangeKey}
            customFrom={customRange.dateFrom}
            customTo={customRange.dateTo}
            onSelectPreset={(key) => {
              setSelectedRangeKey(key);
              setCurrentPage(1);
            }}
            onApplyCustom={(from, to) => {
              setCustomRange({ dateFrom: from, dateTo: to });
              setSelectedRangeKey('custom');
              setCurrentPage(1);
            }}
          />
        </div>

        {/* 5 Stat Cards Grid */}
        <VendorReportStatCards cards={dynamicStatCards} />

        {/* Detailed Orders Table & Mobile List */}
        <VendorReportOrdersTable
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrdersCount={totalOrdersCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
          isLoading={isOrdersLoading}
          selectedVendorId={selectedVendorId}
        />
      </main>
    </div>
  );
}
