import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

interface VendorReportOrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalOrdersCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function VendorReportOrdersPagination({
  currentPage,
  totalPages,
  totalOrdersCount,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}: VendorReportOrdersPaginationProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (totalOrdersCount <= itemsPerPage || totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalOrdersCount);

  const paginationRange = getPaginationRange({
    currentPage,
    totalPages,
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-t border-gray-100 bg-white">
      <p className="text-xs font-medium text-gray-400 text-center sm:text-start">
        {t('vendorReports.showingCount', 'Showing {{start}} - {{end}} of {{total}} requests', {
          start: startIndex,
          end: endIndex,
          total: totalOrdersCount,
        })}
      </p>

      <div className="flex items-center gap-1">
        {/* Prev Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Previous Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        {/* Page Buttons & Ellipsis */}
        {paginationRange.map((pageItem, idx) => {
          if (pageItem === DOTS) {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 select-none tracking-widest"
              >
                &#8230;
              </span>
            );
          }

          const pageNum = Number(pageItem);
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                currentPage === pageNum
                  ? 'bg-black text-white shadow-2xs'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Next Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </div>
  );
}
