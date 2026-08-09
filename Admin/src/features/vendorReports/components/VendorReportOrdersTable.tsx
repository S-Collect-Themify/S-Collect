import { useTranslation } from 'react-i18next';
import type { DetailedOrder } from '../types';
import VendorReportOrdersDesktopTable from './VendorReportOrdersDesktopTable';
import VendorReportOrdersMobileList from './VendorReportOrdersMobileList';
import VendorReportOrdersPagination from './VendorReportOrdersPagination';

interface VendorReportOrdersTableProps {
  orders: DetailedOrder[];
  currentPage: number;
  totalPages: number;
  totalOrdersCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  selectedVendorId?: string;
}

export default function VendorReportOrdersTable({
  orders,
  currentPage,
  totalPages,
  totalOrdersCount,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  selectedVendorId = '',
}: VendorReportOrdersTableProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="text-base md:text-lg font-bold text-gray-900">
        {t('vendorReports.detailedOrders', 'Detailed Orders')}
      </h2>

      {/* Card Wrapper */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <VendorReportOrdersDesktopTable
          orders={orders}
          itemsPerPage={itemsPerPage}
          isLoading={isLoading}
          selectedVendorId={selectedVendorId}
        />

        {/* Mobile List View */}
        <VendorReportOrdersMobileList
          orders={orders}
          itemsPerPage={itemsPerPage}
          isLoading={isLoading}
          selectedVendorId={selectedVendorId}
        />

        {/* Pagination Footer */}
        <VendorReportOrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrdersCount={totalOrdersCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
