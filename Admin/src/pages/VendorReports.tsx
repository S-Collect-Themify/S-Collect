import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown } from 'lucide-react';
import PortalDropdown from '../components/ui/PortalDropdown';
import {
  VendorReportHeader,
  VendorReportStatCards,
  VendorReportOrdersTable,
  VendorReportVendorDropdown,
  DATE_RANGES,
  useVendorReportOrders,
  useExportVendorReportMutation,
  type DateRangeKey,
} from '../features/vendorReports';
import {
  useVendors,
  useVendorPayoutStats,
  useVendorPayoutSummary,
} from '../features/vendors/hooks/useVendors';

const ITEMS_PER_PAGE = 20;

export default function VendorReports() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // ── Fetch Vendors for Filter ──────────────────────────────────────────────
  const { data: vendors = [], isLoading: isVendorsLoading } = useVendors();
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  // Auto-select first vendor when list loads if no vendor selected yet
  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [vendors, selectedVendorId]);

  const [selectedRangeKey, setSelectedRangeKey] = useState<DateRangeKey>('last30Days');
  const [currentPage, setCurrentPage] = useState(1);

  // ── React Query for vendor-specific orders & stats ────────────────────────
  const { orders, totalOrdersCount, totalPages, isLoading: isOrdersLoading } = useVendorReportOrders(
    selectedVendorId,
    currentPage,
    ITEMS_PER_PAGE
  );

  const { data: payoutStats } = useVendorPayoutStats(selectedVendorId);
  const { data: payoutSummary } = useVendorPayoutSummary(selectedVendorId);

  // React Mutation for report export actions
  const exportMutation = useExportVendorReportMutation();

  const currentOption = DATE_RANGES.find((r) => r.key === selectedRangeKey) || DATE_RANGES[1];

  // Dynamic stat cards based on selected vendor data
  const dynamicStatCards = useMemo(() => {
    const totalGmv = orders.reduce((acc, o) => acc + (o.amount || 0), 0);
    const totalCommission = orders.reduce((acc, o) => acc + (o.commission || 0), 0);
    const totalNet = orders.reduce((acc, o) => acc + (o.net || 0), 0);

    const gmvVal = payoutStats?.totalSales
      ? Number(payoutStats.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : totalGmv > 0
      ? totalGmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '--';

    const commVal = totalCommission > 0
      ? totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '--';

    const payoutsVal = payoutSummary?.totalPayout
      ? Number(payoutSummary.totalPayout).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '--';

    const netVal = totalNet > 0
      ? totalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '--';

    const pendingVal = payoutSummary?.pendingAmount
      ? Number(payoutSummary.pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : payoutStats?.pendingPayouts
      ? Number(payoutStats.pendingPayouts).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '--';

    return [
      {
        id: 'gmv',
        titleKey: 'vendorGmv',
        defaultTitle: 'Vendor GMV',
        value: gmvVal,
        currency: 'SAR',
        iconName: 'gmv' as const,
      },
      {
        id: 'commission',
        titleKey: 'platformCommission',
        defaultTitle: 'Platform Commission',
        value: commVal,
        currency: 'SAR',
        iconName: 'commission' as const,
      },
      {
        id: 'payouts',
        titleKey: 'totalPayouts',
        defaultTitle: 'Total Payouts',
        value: payoutsVal,
        currency: 'SAR',
        iconName: 'payouts' as const,
      },
      {
        id: 'net',
        titleKey: 'netVendorPayable',
        defaultTitle: 'Net Vendor Payable',
        value: netVal,
        currency: 'SAR',
        iconName: 'net' as const,
      },
      {
        id: 'pending',
        titleKey: 'pendingPayout',
        defaultTitle: 'Pending Payout',
        value: pendingVal,
        currency: 'SAR',
        iconName: 'pending' as const,
      },
    ];
  }, [orders, payoutStats, payoutSummary]);

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
      fileName: `vendor_sales_report_${selectedVendorId || 'all'}_${selectedRangeKey}`,
      title: t('vendorReports.title', 'Vendor Sales Report'),
      headers: exportHeaders,
      data: orders,
    });
  };

  const handleExportPDF = () => {
    exportMutation.mutate({
      format: 'pdf',
      fileName: `vendor_sales_report_${selectedVendorId || 'all'}_${selectedRangeKey}`,
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

          <PortalDropdown
            minWidth={160}
            align={isRtl ? 'left' : 'right'}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 z-50"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-2 h-10 px-3.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer shrink-0"
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
        />
      </main>
    </div>
  );
}
