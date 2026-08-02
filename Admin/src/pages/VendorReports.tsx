import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import PortalDropdown from '../components/ui/PortalDropdown';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { getAdminOrders } from '../services/orders';
import {
  VendorReportHeader,
  VendorReportStatCards,
  VendorReportOrdersTable,
  STAT_CARDS_DATA,
  DATE_RANGES,
  type DateRangeKey,
  type DetailedOrder,
  type OrderStatus,
} from '../features/vendorReports';

const ITEMS_PER_PAGE = 5;

export default function VendorReports() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [selectedRangeKey, setSelectedRangeKey] = useState<DateRangeKey>('last30Days');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch real admin orders from API
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await getAdminOrders({
          pageNum: currentPage,
          pageSize: ITEMS_PER_PAGE,
        });

        if (!isMounted) return;

        const mapped: DetailedOrder[] = (res.items || []).map((ord) => {
          const shortId = ord.id
            ? ord.id.length > 8
              ? ord.id.slice(-6).toUpperCase()
              : ord.id
            : '--';
          const orderIdStr = ord.id ? `#ORD-${shortId}` : '--';
          const dateStr = ord.createdAt
            ? new Date(ord.createdAt).toISOString().split('T')[0]
            : '--';

          const amt = ord.grandTotalAmount ?? ord.subtotalAmount ?? 0;
          const statusLower = (ord.overallStatus || ord.paymentStatus || 'processing').toLowerCase();
          let parsedStatus: OrderStatus = 'processing';
          if (['delivered', 'completed'].includes(statusLower)) parsedStatus = 'delivered';
          else if (['canceled', 'cancelled'].includes(statusLower)) parsedStatus = 'canceled';
          else if (['shipped'].includes(statusLower)) parsedStatus = 'shipped';

          return {
            id: orderIdStr,
            date: dateStr,
            amount: amt,
            commission: 0,
            net: amt,
            status: parsedStatus,
          };
        });

        setOrders(mapped);
        setTotalOrdersCount(res.pagination?.totalItems ?? mapped.length);
        setTotalPages(res.pagination?.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to fetch vendor report orders:', err);
        if (isMounted) {
          setOrders([]);
          setTotalOrdersCount(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [currentPage, selectedRangeKey]);

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
    exportToCSV(`vendor_sales_report_${selectedRangeKey}`, exportHeaders, orders);
    toast.success(t('vendorReports.exportSuccess', 'Vendor Sales Report exported successfully!'));
  };

  const handleExportPDF = () => {
    exportToPDF(
      t('vendorReports.title', 'Vendor Sales Report'),
      exportHeaders,
      orders
    );
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
